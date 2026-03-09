'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { initWallet } from '@/lib/ethereum';

interface WalletContextValue {
  account: string;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue>({
  account: '',
  connected: false,
  connect: async () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState('');
  const [connected, setConnected] = useState(false);

  const connect = useCallback(async () => {
    try {
      const addr = await initWallet();
      setAccount(addr);
      setConnected(true);
    } catch (e: any) {
      alert(e.message ?? String(e));
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount('');
    setConnected(false);
  }, []);

  return (
    <WalletContext.Provider value={{ account, connected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
