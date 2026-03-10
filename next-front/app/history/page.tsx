'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { getUserBattles, type BattleRecord } from '@/lib/rpc';
import FightModal from '@/components/FightModal';
import { Trophy, RefreshCw, Loader2 } from 'lucide-react';

export default function HistoryPage() {
  const { account } = useWallet();
  const [battles, setBattles] = useState<BattleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewing, setViewing] = useState<BattleRecord | null>(null);

  const refresh = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
      setBattles(await getUserBattles(account));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="space-y-8">
      <div className="border-b-2 border-stone-800 pb-6">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-stone-100">The Chronicles</h2>
        <p className="text-stone-500 text-sm italic">The ink dries upon your legacy</p>
      </div>

      <button onClick={refresh} disabled={loading}
        className="bg-stone-800 hover:bg-stone-700 text-stone-400 px-5 py-2.5 font-bold border-b-4 border-stone-900 active:border-b-0 active:translate-y-0.5 transition-all uppercase tracking-widest text-xs">
        {loading ? <><Loader2 size={14} className="animate-spin" /> Loading…</> : <><RefreshCw size={14} /> Refresh</>}
      </button>

      {!account && (
        <p className="text-stone-500 italic">Bond your signet to see your chronicles.</p>
      )}

      {account && battles.length === 0 && !loading && (
        <div className="bg-[#14110f] border-2 border-dashed border-stone-800 p-20 flex flex-col items-center opacity-40">
          <Trophy size={64} className="mb-5" />
          <p className="text-stone-500 text-xl italic">The scrolls of victory are empty.</p>
        </div>
      )}

      <div className="bg-[#14110f] border-2 border-stone-800 shadow-2xl overflow-hidden">
        {battles.map((b) => (
          <div key={b.game_id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 sm:px-8 py-4 sm:py-5 gap-3 border-b border-stone-800 last:border-b-0 hover:bg-stone-800/20 transition-colors group">
            <div className="flex items-center gap-4 sm:gap-8">
              <div className="w-10 h-10 bg-stone-900 border border-stone-700 flex items-center justify-center text-stone-500 font-mono text-xs shrink-0">
                #{b.game_id}
              </div>
              <div>
                {b.fighters && b.fighters.length >= 2 && (
                  <p className="text-sm font-black italic text-stone-200 uppercase tracking-tight mb-0.5">
                    {b.fighters[0]?.name ?? '?'} vs {b.fighters[1]?.name ?? '?'}
                  </p>
                )}
                {b.winner && (
                  <p className="text-xs text-amber-600 font-bold uppercase tracking-widest">
                    <Trophy size={12} className="inline mr-1" />{typeof b.winner === 'object' ? b.winner.name : b.winner}
                  </p>
                )}
              </div>
            </div>
            <button onClick={() => setViewing(b)}
              className="self-start sm:self-auto px-5 py-2 bg-stone-900 hover:bg-amber-900 text-stone-400 hover:text-amber-100 border border-stone-700 font-bold uppercase tracking-widest text-xs transition-all">
              Watch Replay
            </button>
          </div>
        ))}
      </div>

      {viewing && (
        <FightModal battle={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}
