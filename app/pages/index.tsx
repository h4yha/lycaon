import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { Container } from '../components/Container';
import { RaffleComponent, RaffleProps } from '../components/RaffleComponent';
import {
  fetchAllRaffles,
  getProgram,
  IDL,
  RaffleIdlType,
  RAFFLE_PROG_ID,
} from '../contracts';

const Home = () => {
  const { wallet, publicKey } = useWallet();
  const { connection } = useConnection();

  const [loading, setLoading] = useState(true);
  const [raffles, setRaffles] = useState<RaffleProps[]>([]);

  useEffect(() => {
    if (!wallet) return;

    const program = getProgram<RaffleIdlType>(
      wallet,
      IDL,
      RAFFLE_PROG_ID,
      connection
    );

    fetchAllRaffles(connection, program)
      .then((allRaffles) => {
        const formatRaffles = allRaffles.map((raffle) => ({
          name: raffle.account.name,
          raffleManager: raffle.account.raffleManager,
          rafflePrice: raffle.account.rafflePrice,
          mint: raffle.account.prizeTokenMint,
          splTokenCost: raffle.account.splTokenMint,
        }));

        setRaffles(formatRaffles);
        setLoading(false);
      })
      .catch(console.error);
  }, [connection, wallet]);

  return (
    <Container>
      <div className="mt-8">
        <div className="flex items-center gap-1 mt-4">
          <h1 className="text-2xl">Raffles</h1>
          <span>•</span>
          <p className="text-slate-200">Devnet</p>
        </div>

        <div className="flex items-center justify-center mt-8">
          {/* eslint-disable-next-line no-nested-ternary */}
          {!publicKey ? (
            'Connect your wallet first'
          ) : loading ? (
            'Loading...'
          ) : (
            <div className="grid grid-cols-3 gap-8 mt-4">
              {/* {raffles.length > 0 ? (
                raffles.map((raffle) => (
                  <RaffleComponent
                    splTokenCost={raffle.splTokenCost}
                    name={raffle.name}
                    raffleManager={raffle.raffleManager}
                    rafflePrice={raffle.rafflePrice}
                    mint={raffle.mint}
                  />
                ))
              ) : (
                <>
                  <h1>no raffle found</h1>
                  <button type="button" className="mt-4">
                    Create Raffle
                  </button>
                </>
              )} */}

              {/* mock */}
              <RaffleComponent
                splTokenCost={
                  new PublicKey('81rEV5ytxXfJSJ64YPNRenLcnysGcd3uw6RCRJWmRn4i')
                }
                name="1 NFT"
                raffleManager={publicKey}
                rafflePrice={0.25}
                mint={
                  new PublicKey('815dHUetGFwJ4gKYM5PkQcSPt7wXyZQjWiymFJMtYxdY')
                }
              />
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Home;
