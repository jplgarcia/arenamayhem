'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { initWallet, addInput } from '@/lib/ethereum';
import { getERC20Balance } from '@/lib/inspect';
import { config } from '@/lib/config';
import FighterModal, { type Fighter } from '@/components/FighterModal';
import { Sword, RefreshCw, Loader2 } from 'lucide-react';
import { formatEther } from 'viem';

export default function ChallengesPage() {
  const { account, connected, connect } = useWallet();
  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState<any | null>(null); // report being accepted

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await fetch(`/inspect/${config.dappAddress}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'battles',
      });
      const data = await raw.json();
      if (data?.reports?.length) {
        const hex = data.reports[0].payload as string;
        const str = Buffer.from(hex.replace('0x', ''), 'hex').toString('utf8');
        setBattles(JSON.parse(str));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function handleAccept(report: any) {
    if (!connected) { await connect(); return; }
    await initWallet();

    const balance = await getERC20Balance(account, config.erc20TokenAddress);
    if (BigInt(balance) < BigInt(report.amount)) {
      alert('Not enough in-app ERC-20 balance. Go to Assets to deposit.');
      return;
    }
    setAccepting(report);
  }

  async function submitAccept(fighter: Fighter) {
    if (!accepting) return;
    await initWallet();
    await addInput(JSON.stringify({
      method: 'accept_challenge',
      fighter,
      seed: fighter.seed,
      challenge_id: accepting.id,
    }));
    setAccepting(null);
    setTimeout(refresh, 3000);
  }

  // Filter to only pending challenges not owned by current user
  const openBattles = battles.filter(
    (b) => b.status === 'pending' && b.owner?.toLowerCase() !== account?.toLowerCase(),
  );

  return (
    <div className="space-y-8">
      <div className="border-b-2 border-stone-800 pb-6">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-stone-100">The Pit</h2>
        <p className="text-stone-500 text-sm italic">Accept a challenge and prepare for the slaughter</p>
      </div>

      <button onClick={refresh} disabled={loading}
        className="bg-stone-800 hover:bg-stone-700 text-stone-400 px-5 py-2.5 font-bold border-b-4 border-stone-900 active:border-b-0 active:translate-y-0.5 transition-all uppercase tracking-widest text-xs">
        {loading ? <><Loader2 size={14} className="animate-spin" /> Loading…</> : <><RefreshCw size={14} /> Refresh</>}
      </button>

      {battles.length === 0 && !loading && (
        <div className="bg-[#14110f] border-2 border-dashed border-stone-800 p-20 flex flex-col items-center">
          <Sword size={64} className="text-stone-800 mb-5" />
          <p className="text-stone-500 text-lg italic">No challengers await in the pit.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {battles.map((b: any) => (
          <div key={b.id}
            className="bg-[#14110f] border-2 border-stone-800 p-8 shadow-2xl relative group overflow-hidden hover:border-amber-900/40 transition-colors">
            <div className="absolute -top-8 -right-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12"><Sword size={96} /></div>

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-stone-900 border border-stone-700 flex items-center justify-center text-stone-500 font-mono text-xs">
                  {b.id}
                </div>
                <div>
                  <p className="text-[10px] text-stone-600 uppercase font-bold">Signet</p>
                  <p className="text-xs font-mono text-amber-800 font-bold">
                    {b.owner ? `${b.owner.slice(0,8)}…${b.owner.slice(-4)}` : '?'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-stone-600 uppercase font-black">Pot</p>
                <p className="text-2xl font-black italic text-stone-100 leading-none">
                  {formatEther(BigInt(b.amount))} <span className="text-[10px] not-italic text-stone-600">tokens</span>
                </p>
              </div>
            </div>

            <div className="bg-stone-950/50 p-5 mb-6 border border-stone-800 italic">
              <p className="text-[10px] text-stone-600 uppercase font-bold not-italic mb-1">Status</p>
              <p className="text-lg font-black text-amber-700 uppercase tracking-tight">{b.status}</p>
            </div>

            {b.status === 'pending' &&
             b.owner?.toLowerCase() !== account?.toLowerCase() && (
              <button onClick={() => handleAccept(b)}
                className="w-full bg-transparent hover:bg-stone-800 text-stone-400 hover:text-stone-100 border border-stone-700 py-3 font-bold transition-all uppercase tracking-[0.15em] text-xs">
                Enter the Fray
              </button>
            )}
            {b.owner?.toLowerCase() === account?.toLowerCase() && (
              <p className="text-center text-stone-700 text-xs uppercase tracking-widest italic">
                Your challenge — awaiting a rival
              </p>
            )}
          </div>
        ))}
      </div>

      {accepting && (
        <FighterModal
          message="Forge your warrior for this duel"
          value={accepting.amount ? formatEther(BigInt(accepting.amount)) : undefined}
          onConfirm={submitAccept}
          onCancel={() => setAccepting(null)}
        />
      )}
    </div>
  );
}
