import { JsonMetadata } from '@metaplex-foundation/js';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { getNFTMetadata } from '../utils/getNFTMetadata';

export interface RaffleProps {
  name: string;
  raffleManager: PublicKey;
  splTokenCost: PublicKey;
  rafflePrice: number;
  mint: PublicKey;
}

export const RaffleComponent = ({
  name,
  raffleManager,
  splTokenCost,
  rafflePrice,
  mint,
}: RaffleProps) => {
  const { connection } = useConnection();

  const [nftMetadata, setNftMetadata] = useState<JsonMetadata>();

  useEffect(() => {
    getNFTMetadata(connection, mint)
      .then((metadata) => setNftMetadata(metadata))
      // eslint-disable-next-line no-console
      .catch(console.error);
  }, [connection, mint, splTokenCost]);

  return (
    <div className="flex flex-col flex-1 p-2 bg-slate-700 hover:bg-slate-800 hover:cursor-pointer hover:scale-105">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-[300px] h-[300px]"
          alt="nft"
          src={nftMetadata?.image || '/noavailableimg.png'}
        />

        <h1 className="mt-2">{name}</h1>
        <h4 className="mt-1">{rafflePrice}</h4>
      </div>
    </div>
  );
};
