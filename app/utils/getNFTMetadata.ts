import { Metaplex } from '@metaplex-foundation/js';
import { Connection, PublicKey } from '@solana/web3.js';

export const getNFTMetadata = async (
  connection: Connection,
  mint: PublicKey
) => {
  const metaplex = new Metaplex(connection);

  const nft = await metaplex.nfts().findByMint(mint);

  return nft.metadata;
};
