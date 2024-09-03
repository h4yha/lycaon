import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

export const creatMintToken = async (
  connection: Connection,
  authority: Keypair
) => {
  const token = await Token.createMint(
    connection,
    authority,
    authority.publicKey,
    authority.publicKey,
    0,
    TOKEN_PROGRAM_ID
  );

  return token;
};

export const fundATA = async (
  token: Token,
  authority: Keypair,
  wallet: PublicKey,
  amount: number
) => {
  const account = await token.createAssociatedTokenAccount(wallet);
  await token.mintTo(account, authority, [], amount);

  return account;
};
