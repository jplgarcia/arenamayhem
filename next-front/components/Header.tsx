'use client';

import { useWallet } from '@/contexts/WalletContext';
import { Sword, Wifi, WifiOff } from 'lucide-react';

export default function Header() {
  const { account, connected, connect, disconnect } = useWallet();
  const short = account ? `${account.slice(0, 6)}…${account.slice(-4)}` : '';

  return (
    <header className="border-b-4 border-double border-stone-800 bg-[#14110f] sticky top-0 z-50 shadow-2xl">
      <div className="max-w-full px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="relative bg-stone-900 border-2 border-stone-700 p-1.5 sm:p-2 rounded-md rotate-3 shrink-0">
            <Sword size={20} className="text-amber-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black tracking-widest uppercase italic text-stone-100 drop-shadow-lg truncate">
              Arena <span className="text-amber-700">Mayhem</span>
            </h1>
            <p className="hidden sm:block text-[10px] tracking-[0.3em] uppercase text-stone-500 font-sans">
              Blockchain Blood &amp; Steel
            </p>
          </div>
        </div>

        {/* Wallet */}
        {!connected ? (
          <button
            onClick={connect}
            className="flex items-center gap-2 bg-amber-900 hover:bg-amber-800 text-amber-100 px-3 sm:px-6 py-2 font-bold border-b-4 border-amber-950 active:border-b-0 active:translate-y-0.5 transition-all shadow-lg uppercase tracking-wider text-xs sm:text-sm shrink-0"
          >
            <Sword size={14} /> <span className="hidden sm:inline">Connect Signet</span><span className="sm:hidden">Connect</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            <div className="hidden sm:flex flex-col items-end leading-none">
              <span className="text-[10px] text-stone-500 uppercase font-sans mb-1 font-bold">Signet</span>
              <span className="font-mono text-stone-300 text-sm">{short}</span>
            </div>
            <span className="sm:hidden font-mono text-stone-400 text-xs">{short}</span>
            <div className="hidden sm:block h-8 w-px bg-stone-800" />
            <div className="flex items-center gap-1.5 sm:gap-2 bg-stone-900 border border-stone-800 px-2 sm:px-3 py-1.5 rounded">
              <div className="w-2 h-2 rounded-full bg-green-900 animate-pulse border border-green-500" />
              <span className="hidden sm:inline text-[10px] text-stone-500 uppercase font-bold">Connected</span>
            </div>
            <button
              onClick={disconnect}
              className="text-[10px] text-stone-600 hover:text-red-400 uppercase tracking-widest font-bold transition-colors"
            >
              Leave
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
