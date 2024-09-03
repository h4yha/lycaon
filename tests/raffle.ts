/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as anchor from '@project-serum/anchor';
import { Program, BN } from '@project-serum/anchor';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_SLOT_HISTORY_PUBKEY,
} from '@solana/web3.js';
import { assert } from 'chai';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Raffle } from '../target/types/raffle';
import { creatMintToken, fundATA } from './utils';

describe('raffle', () => {
  const provider = anchor.getProvider();

  anchor.setProvider(provider);

  const { connection } = provider;

  const program = anchor.workspace.Raffle as Program<Raffle>;

  // global state
  const payer = anchor.web3.Keypair.generate();
  const bank = anchor.web3.Keypair.generate();

  let token: Token;
  let tokenMint: PublicKey;
  let tokenAcc: PublicKey;
  let bankAcc: PublicKey;
  let raffleAcc: PublicKey;
  let prizeTokenMint: Token;
  let prizeTokenMintAccount: PublicKey;
  let vaultAddr: PublicKey;

  const today = new Date();
  const todayTimestamp = Math.round(today.getTime() / 1000 + 10);

  const todayPlus5Days = new Date();
  todayPlus5Days.setDate(todayPlus5Days.getDate() + 5);
  const todayPlus5DaysTimeStamp = Math.round(todayPlus5Days.getTime() / 1000);

  before('fund wallet', async () => {
    const bankFund = await program.provider.connection.requestAirdrop(
      bank.publicKey,
      50 * anchor.web3.LAMPORTS_PER_SOL
    );

    const payerFund = await program.provider.connection.requestAirdrop(
      payer.publicKey,
      50 * anchor.web3.LAMPORTS_PER_SOL
    );
    await program.provider.connection.confirmTransaction(bankFund);
    await program.provider.connection.confirmTransaction(payerFund);
  });

  before('create mint token', async () => {
    token = await creatMintToken(connection, payer);
    prizeTokenMint = await creatMintToken(connection, payer);

    tokenAcc = await fundATA(token, payer, payer.publicKey, 10000);
    bankAcc = await fundATA(token, payer, bank.publicKey, 0);

    prizeTokenMintAccount = await fundATA(
      prizeTokenMint,
      payer,
      payer.publicKey,
      1
    );

    tokenMint = token.publicKey;

    console.log({
      tokenMint: token.publicKey.toBase58(),
      tokenAcc: token.publicKey.toBase58(),
      bankAcc: bankAcc.toBase58(),
      prizeTokenMintAccount: prizeTokenMintAccount.toBase58(),
      prizeTokenMint: prizeTokenMint.publicKey.toBase58(),
    });
  });

  it('Init vault', async () => {
    const [vault, vaultBump] = await PublicKey.findProgramAddress(
      [Buffer.from('vault-account'), payer.publicKey.toBuffer()],
      program.programId
    );

    console.log({
      vaultAddr: vault.toBase58(),
    });

    await program.rpc.initVault({
      accounts: {
        vault,
        payer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [payer],
    });

    const vaultAccount = await program.account.vault.fetch(vault);

    console.log({
      vaultA: vaultAccount.authority.toBase58(),
    });

    assert.equal(vaultAccount.creator.toBase58(), payer.publicKey.toBase58());
  });

  it('Create raffle', async () => {
    const raffle = anchor.web3.Keypair.generate();

    raffleAcc = raffle.publicKey;

    const entrants = anchor.web3.Keypair.generate();

    const [vault, vaultBump] = await PublicKey.findProgramAddress(
      [Buffer.from('vault-account'), payer.publicKey.toBuffer()],
      program.programId
    );

    vaultAddr = vault;

    const [prizeBox, prizeBoxDump] = await PublicKey.findProgramAddress(
      [
        Buffer.from('token-seed'), // TODO - change to token-box
        vault.toBuffer(),
        prizeTokenMint.publicKey.toBuffer(),
      ],
      program.programId
    );

    const [vaultAuth, vaultAuthBump] = await PublicKey.findProgramAddress(
      [Buffer.from('vault'), vault.toBuffer()],
      program.programId
    );

    console.log({
      vaultAuth: vaultAuth.toBase58(),
      vaultAuthBump,
      prize_box: prizeBox.toBase58(),
    });

    await program.rpc.createRaffle(
      vaultAuthBump,
      'Raffle 1',
      new BN(20),
      new BN(155),
      new BN(todayTimestamp),
      new BN(todayPlus5DaysTimeStamp),
      new BN(20),
      new BN(5),
      {
        accounts: {
          raffle: raffle.publicKey,
          entrants: entrants.publicKey,
          prizeTokenMint: prizeTokenMint.publicKey,
          prizeTokenAccount: prizeTokenMintAccount,
          splTokenMint: tokenMint,
          prizeBox,
          authority: vaultAuth,
          vault,
          creator: payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        instructions: [
          await program.account.entrants.createInstruction(entrants),
        ],
        signers: [payer, raffle, entrants],
      }
    );

    const raffleAccount = await program.account.raffle.fetch(raffle.publicKey);

    console.log({
      entrantsPubkey: raffleAccount.entrants.toBase58(),
      entrantsKeyPair: entrants.publicKey.toBase58(),
      entrantsSize: program.account.entrants.size,
    });

    console.log(
      'receiver token balance: ',
      await program.provider.connection.getTokenAccountBalance(prizeBox)
    );

    assert.equal(raffleAccount.name, 'Raffle 1');
    assert.equal(raffleAccount.totalWinners, 5);
  });

  it('Buy ticket', async () => {
    const { entrants, vault } = await program.account.raffle.fetch(raffleAcc);

    const [ticketPDA, _] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('tickets'),
        raffleAcc.toBuffer(),
        payer.publicKey.toBuffer(),
      ],
      program.programId
    );

    const [vaultAuth, vaultAuthBump] = await PublicKey.findProgramAddress(
      [Buffer.from('vault'), vault.toBuffer()],
      program.programId
    );

    const [tokenBox] = await PublicKey.findProgramAddress(
      [
        Buffer.from('token-seed'), // TODO - change to prize-box
        vaultAddr.toBuffer(),
        tokenMint.toBuffer(),
      ],
      program.programId
    );

    console.log({
      raffle: raffleAcc.toBase58(),
      ticketPDA: ticketPDA.toBase58(),
      entrantsPDA: entrants.toBase58(),
    });

    await program.rpc.buyTickets(vaultAuthBump, 1, {
      accounts: {
        entrants,
        vault: vaultAddr,
        raffle: raffleAcc,
        tickets: ticketPDA,
        tokenAccount: tokenAcc,
        tokenMint,
        tokenBox,
        authority: vaultAuth,
        payer: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [payer],
    });

    const tickets = await program.account.tickets.fetch(ticketPDA);

    console.log({
      ticketsAmount: tickets.amount,
    });

    console.log(
      'receiver token balance: ',
      await program.provider.connection.getTokenAccountBalance(tokenBox)
    );

    await program.rpc.buyTickets(vaultAuthBump, 5, {
      accounts: {
        entrants,
        vault: vaultAddr,
        raffle: raffleAcc,
        tickets: ticketPDA,
        tokenAccount: tokenAcc,
        tokenMint,
        tokenBox,
        authority: vaultAuth,
        payer: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [payer],
    });

    const ticketsRefetch = await program.account.tickets.fetch(ticketPDA);
    const entrantsAccount = await program.account.entrants.fetch(entrants);

    console.log(
      'receiver token balance: ',
      await program.provider.connection.getTokenAccountBalance(tokenBox)
    );

    console.log({
      entrantsAccount0: entrantsAccount.entries[0].toBase58(),
    });

    console.log({
      balance: (await connection.getBalance(vaultAddr)) / LAMPORTS_PER_SOL,
      getParsedTokenAccountsByOwner:
        await connection.getParsedTokenAccountsByOwner(vaultAddr, {
          mint: prizeTokenMint.publicKey,
        }),
    });

    assert.equal(tickets.amount, 1);
    assert.equal(ticketsRefetch.amount, 6);
  });

  it('Buy ticket with another wallet', async () => {
    const wallet = anchor.web3.Keypair.generate();
    const { entrants, vault } = await program.account.raffle.fetch(raffleAcc);

    const [ticketPDA, _] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('tickets'),
        raffleAcc.toBuffer(),
        wallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    const fundWallet = await program.provider.connection.requestAirdrop(
      wallet.publicKey,
      5 * anchor.web3.LAMPORTS_PER_SOL
    );
    await program.provider.connection.confirmTransaction(fundWallet);
    const tokenAccount = await fundATA(token, payer, wallet.publicKey, 5000);

    const [vaultAuth, vaultAuthBump] = await PublicKey.findProgramAddress(
      [Buffer.from('vault'), vault.toBuffer()],
      program.programId
    );

    const [tokenBox] = await PublicKey.findProgramAddress(
      [
        Buffer.from('token-seed'), // TODO - change to token-box
        vaultAddr.toBuffer(),
        tokenMint.toBuffer(),
      ],
      program.programId
    );

    await program.rpc.buyTickets(vaultAuthBump, 2, {
      accounts: {
        entrants,
        vault: vaultAddr,
        raffle: raffleAcc,
        tickets: ticketPDA,
        tokenAccount,
        tokenMint,
        tokenBox,
        authority: vaultAuth,
        payer: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [wallet],
    });

    const tickets = await program.account.tickets.fetch(ticketPDA);

    console.log({
      ticketsAmount: tickets.amount,
    });

    console.log(
      'receiver token balance: ',
      await program.provider.connection.getTokenAccountBalance(bankAcc)
    );

    const entrantsAccount = await program.account.entrants.fetch(entrants);

    console.log(
      'receiver token balance: ',
      await program.provider.connection.getTokenAccountBalance(bankAcc)
    );

    assert.equal(tickets.amount, 2);
  });

  it('Buy ticket with wrong token', async () => {
    const { entrants, vault } = await program.account.raffle.fetch(raffleAcc);
    const [ticketPDA, _] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('tickets'),
        raffleAcc.toBuffer(),
        payer.publicKey.toBuffer(),
      ],
      program.programId
    );

    const tokenWrong = await creatMintToken(connection, payer);
    await fundATA(tokenWrong, payer, payer.publicKey, 10000);

    const tokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenWrong.publicKey,
      payer.publicKey
    );

    const [vaultAuth, vaultAuthBump] = await PublicKey.findProgramAddress(
      [Buffer.from('vault'), vault.toBuffer()],
      program.programId
    );

    const [tokenBox] = await PublicKey.findProgramAddress(
      [
        Buffer.from('token-seed'), // TODO - change to prize-box
        vaultAddr.toBuffer(),
        tokenWrong.publicKey.toBuffer(),
      ],
      program.programId
    );

    console.log({
      ticketPDA: ticketPDA.toBase58(),
      tokenAccount: tokenAccount.toBase58(),
      entrants: entrants.toBase58(),
    });

    try {
      await program.rpc.buyTickets(vaultAuthBump, 1, {
        accounts: {
          entrants,
          vault: vaultAddr,
          raffle: raffleAcc,
          tickets: ticketPDA,
          tokenAccount,
          tokenMint: tokenWrong.publicKey,
          tokenBox,
          authority: vaultAuth,
          payer: payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [payer],
      });
    } catch ({ error }) {
      console.log({
        error,
      });
      assert.equal(error.errorMessage, 'Invalid token account for this raffle');
    }
  });

  it('List all tickets from a raffle', async () => {
    const tickets = await program.account.tickets.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: raffleAcc.toBase58(),
        },
      },
    ]);

    assert.equal(tickets.length, 2);
  });

  it('Lock/unlock raffle', async () => {
    await program.rpc.lockRaffle(false, {
      accounts: {
        raffle: raffleAcc,
        raffleManager: payer.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [payer],
    });

    const raffleAccount = await program.account.raffle.fetch(raffleAcc);

    console.log({
      raffleLocked: raffleAccount.locked,
    });

    assert.equal(raffleAccount.locked, false);
  });

  it('finish raffle', async () => {
    await program.rpc.finishRaffle({
      accounts: {
        raffle: raffleAcc,
        raffleManager: payer.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [payer],
    });

    const raffleAccount = await program.account.raffle.fetch(raffleAcc);

    console.log({
      raffleFinish: raffleAccount.ended,
    });

    assert.equal(raffleAccount.ended, true);
  });

  it('List all tickets of a wallet from raffle', async () => {
    const [ticketPDA, _] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('tickets'),
        raffleAcc.toBuffer(),
        payer.publicKey.toBuffer(),
      ],
      program.programId
    );

    const tickets = await program.account.tickets.fetch(ticketPDA);

    console.log({
      raffleEx: raffleAcc.toBase58(),
      tickets,
    });
    assert.equal(tickets.amount, 6);
    assert.equal(tickets.raffle.toBase58(), raffleAcc.toBase58());
  });

  it('pick winner', async () => {
    const raffleAccount = await program.account.raffle.fetch(raffleAcc);

    await program.rpc.pickWinners({
      accounts: {
        raffle: raffleAcc,
        entrants: raffleAccount.entrants,
        systemProgram: SystemProgram.programId,
        raffleManager: payer.publicKey,
        slotHashes: SYSVAR_SLOT_HISTORY_PUBKEY,
      },
      signers: [payer],
    });

    const raffleRefetch = await program.account.raffle.fetch(raffleAcc);

    console.log({
      winners: raffleRefetch.winners,
    });

    assert.lengthOf(raffleRefetch.winners, 1);
  });

  it('pick winner without being a raffle manager', async () => {
    const { entrants } = await program.account.raffle.fetch(raffleAcc);
    const wallet = new anchor.web3.Keypair();

    console.log({
      walletPubkey: wallet.publicKey.toBase58(),
      payerPubkey: payer.publicKey.toBase58(),
    });

    const fundWallet = await program.provider.connection.requestAirdrop(
      wallet.publicKey,
      5 * anchor.web3.LAMPORTS_PER_SOL
    );
    await program.provider.connection.confirmTransaction(fundWallet);

    const slotHashes = new anchor.web3.PublicKey(
      'SysvarS1otHashes111111111111111111111111111'
    );

    try {
      await program.rpc.pickWinners({
        accounts: {
          raffle: raffleAcc,
          entrants,
          systemProgram: SystemProgram.programId,
          raffleManager: wallet.publicKey,
          slotHashes,
        },
        signers: [wallet],
      });
    } catch ({ error }) {
      assert.equal(
        error.errorMessage,
        'Invalid raffle_manager for this raffle'
      );
    }
  });

  it('claim prize', async () => {
    const {
      entrants,
      vault,
      prizeTokenAccount: tokenAccount,
      prizeTokenMint: prizeMint,
      winners,
    } = await program.account.raffle.fetch(raffleAcc);

    console.log({
      winners: winners.map((pb) => pb.toBase58()),
    });

    const [vaultAuth, vaultAuthBump] = await PublicKey.findProgramAddress(
      [Buffer.from('vault'), vaultAddr.toBuffer()],
      program.programId
    );

    console.log({
      vault: vault.toBase58(),
      vaultAddr: vaultAddr.toBase58(),
      vaultAuth: vaultAuth.toBase58(),
      vaultAuthBump,
    });

    const [prizeTokenAccount, prizeTokenBump] =
      await PublicKey.findProgramAddress(
        [
          Buffer.from('token-seed'), // TODO - change to token-box
          vault.toBuffer(),
          prizeTokenMint.publicKey.toBuffer(),
        ],
        program.programId
      );

    const destination = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      prizeMint,
      payer.publicKey
    );

    console.log({
      destination: destination.toBase58(),
      prizeTokenAccount: prizeTokenAccount.toBase58(),
      prizeTokenMint: prizeTokenMint.publicKey.toBase58(),
    });

    await program.rpc.claimPrize(vaultAuthBump, prizeTokenBump, {
      accounts: {
        raffle: raffleAcc,
        vault,
        authority: vaultAuth,
        destinationTokenAccount: destination,
        tokenMint: prizeMint,
        winner: payer.publicKey,
        prizeTokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [payer],
    });

    const winnerAccount = await prizeTokenMint.getAccountInfo(destination);

    console.log({
      winnerAccount,
    });

    assert.ok(Number(winnerAccount.amount) === 1);
  });

  it('claim proceeds', async () => {
    const {
      entrants,
      vault,
      prizeTokenAccount: tokenAccount,
      prizeTokenMint: prizeMint,
      winners,
    } = await program.account.raffle.fetch(raffleAcc);

    console.log({
      winners: winners.map((pb) => pb.toBase58()),
    });

    const [vaultAuth, vaultAuthBump] = await PublicKey.findProgramAddress(
      [Buffer.from('vault'), vaultAddr.toBuffer()],
      program.programId
    );

    console.log({
      vault: vault.toBase58(),
      vaultAddr: vaultAddr.toBase58(),
      vaultAuth: vaultAuth.toBase58(),
      vaultAuthBump,
    });

    const [proceedsToken, proceedsTokenBump] =
      await PublicKey.findProgramAddress(
        [
          Buffer.from('token-seed'), // TODO - change to token-box
          vault.toBuffer(),
          tokenMint.toBuffer(),
        ],
        program.programId
      );

    const destination = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenMint,
      payer.publicKey
    );

    console.log({
      destination: destination.toBase58(),
      proceedsToken: proceedsToken.toBase58(),
      tokenMint: tokenMint.toBase58(),
    });

    await program.rpc.claimProceeds(vaultAuthBump, proceedsTokenBump, {
      accounts: {
        raffle: raffleAcc,
        vault,
        authority: vaultAuth,
        destinationTokenAccount: destination,
        tokenMint,
        raffleManager: payer.publicKey,
        proceedsTokenAccount: proceedsToken,
        entrants,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [payer],
    });

    const raffleManagerAccount = await token.getAccountInfo(destination);

    assert.ok(Number(raffleManagerAccount.amount) === 10040);
  });
});
