import React from 'react';
import { Header } from './Header';

interface ContainerProps {
  children: React.ReactNode;
}

export const Container = ({ children }: ContainerProps) => (
  <div className="h-screen min-h-screen text-white bg-slate-900">
    <Header />
    <div className="max-w-[920px] w-full my-0 mx-auto py-0 px-4">
      {children}
    </div>
  </div>
);
