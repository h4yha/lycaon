import React from 'react';
import { WalletButton } from './WalletButton';

// interface HeaderProps {
// }

export const Header = () => (
  <div className="flex items-center justify-between w-full py-4 border-b border-slate-600 px-7">
    Logo
    <WalletButton />
  </div>
);
