import * as anchor from '@project-serum/anchor';
import { Wallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';

export const RAFFLE_PROG_ID = new PublicKey(
  'GFe7k4SGs25xJ3QH9ktpZyZRaFEGTd97qx4kmE1YsSvL'
);

export const getProgram = <T extends anchor.Idl>(
  wallet: Wallet,
  idl: anchor.Idl,
  programId: PublicKey,
  connection: Connection
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const provider = new anchor.AnchorProvider(connection, wallet as any, {
    preflightCommitment: 'recent',
    skipPreflight: false,
    commitment: 'confirmed',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const program = new anchor.Program<T>(idl as any, programId, provider);

  return program;
};
