import { Program } from '@project-serum/anchor';
import { Connection } from '@solana/web3.js';
import { RaffleIdlType } from './types/raffle';

export const fetchAllRaffles = async (
  connection: Connection,
  program: Program<RaffleIdlType>
) => {
  const raffles = await program.account.raffle.all();

  return raffles;
};
