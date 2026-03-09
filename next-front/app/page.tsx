'use client';

import { useState, useEffect, useCallback } from 'react';
import { SHA256, enc } from 'crypto-js';
import { useWallet } from '@/contexts/WalletContext';
import { initWallet, addInput } from '@/lib/ethereum';
import { getERC20Balance } from '@/lib/inspect';
import { getUserBattles, type BattleRecord } from '@/lib/rpc';
import { config } from '@/lib/config';
import FighterModal, { type Fighter } from '@/components/FighterModal';
import FightModal from '@/components/FightModal';
import { Sword, Shield, Coins, RefreshCw, Loader2, Flame, Clock } from 'lucide-react';

type ModalState =
  | { type: 'fighter'; mode: 'create' | 'start'; report: any }
  | { type: 'fight'; battle: BattleRecord }
  | null;

export default function HomePage() {
  const { account, connected, connect } = useWallet();
  const [wage, setWage] = useState(1);
  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  const refresh = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
      const raw = await fetch(`/inspect/${config.dappAddress}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: `user_battles/${account}`,
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
  }, [account]);

  useEffect(() => { refresh(); }, [refresh]);

  async function handleCreateChallenge(e: React.FormEvent) {
    e.preventDefault();
    if (!connected) { await connect(); return; }
    const balance = await getERC20Balance(account, config.erc20TokenAddress);
    const required = BigInt(Math.round(wage * 2 * 1e18));
    if (BigInt(balance) < required) {
      alert('Not enough in-app ERC-20 balance. Go to Assets to deposit.');
      return;
    }
    setModal({ type: 'fighter', mode: 'create', report: null });
  }

  async function submitCreateChallenge(fighter: Fighter) {
    await initWallet();
    const hash = SHA256(
      [fighter.name, fighter.weapon, fighter.hp, fighter.atk, fighter.def, fighter.spd].join('-'),
    ).toString(enc.Hex);
    localStorage.setItem(hash, JSON.stringify(fighter));
    await addInput(JSON.stringify({
      method: 'create_challenge',
      fighter_hash: hash,
      token: config.erc20TokenAddress,
      amount: BigInt(Math.round(wage * 1e18)).toString(),
    }));
    setModal(null);
    setTimeout(refresh, 3000);
  }

  async function handleStartFight(report: any) {
    if (!connected) { await connect(); return; }
    const saved = localStorage.getItem(report.fighter_hash);
    setModal({ type: 'fighter', mode: 'start', report: { ...report, savedFighter: saved ? JSON.parse(saved) : undefined } });
  }

  async function submitStartFight(fighter: Fighter, report: any) {
    await initWallet();
    await addInput(JSON.stringify({ method: 'start_match', fighter, challenge_id: report.id }));
    setModal(null);
    for (let i = 0; i < 24; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const list = await getUserBattles(account);
      const found = list.find((b) => b.game_id === report.id);
      if (found) { setModal({ type: 'fight', battle: found }); return; }
    }
    alert('Battle result not yet available. Check History later.');
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="border-b-2 border-stone-800 pb-6">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-stone-100">
          My Fighters
        </h2>
        <p className="text-stone-500 text-sm italic">Manage your challenges and commence battle</p>
      </div>

      {!connected && (
        <p className="text-stone-500 italic">Bond your digital signet to create or manage battles.</p>
      )}

      {/* Create challenge form */}
      <form onSubmit={handleCreateChallenge}
        className="bg-[#14110f] border-2 border-stone-800 p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-amber-900/30 to-transparent" />
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-700 mb-5"><Sword size={14} /> Forge a Challenge</h3>
        <div className="flex items-end gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Wager (tokens)</span>
            <input
              type="number" min={0} step="any" value={wage}
              onChange={(e) => setWage(Number(e.target.value))}
              className="bg-stone-950 border border-stone-700 px-4 py-2.5 w-36 text-stone-200 focus:outline-none focus:border-amber-900 font-mono"
            />
          </label>
          <button type="submit"
            className="bg-amber-900 hover:bg-amber-800 text-amber-100 px-6 py-2.5 font-bold border-b-4 border-amber-950 active:border-b-0 active:translate-y-0.5 transition-all uppercase tracking-widest text-xs shadow-lg">
            Enter the Pit
          </button>
          <button type="button" onClick={refresh} disabled={loading}
            className="bg-stone-800 hover:bg-stone-700 text-stone-400 px-4 py-2.5 font-bold border-b-4 border-stone-900 active:border-b-0 active:translate-y-0.5 transition-all uppercase tracking-widest text-xs">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <><RefreshCw size={14} /> Refresh</>}
          </button>
        </div>
      </form>

      {battles.length === 0 && !loading && (
        <div className="bg-[#14110f] border-2 border-dashed border-stone-800 p-20 flex flex-col items-center shadow-inner">
          <Shield size={64} className="text-stone-800 mb-5" />
          <p className="text-stone-500 text-lg italic">Your barracks are empty, traveler.</p>
        </div>
      )}

      <div className="grid gap-5">
        {battles.map((b: any) => (
          <div key={b.id}
            className="bg-[#14110f] border-2 border-stone-800 p-7 flex items-center justify-between group hover:border-amber-900/40 transition-all shadow-xl">
            <div className="flex items-center gap-7">
              <div className="w-14 h-14 bg-stone-900 border-2 border-stone-800 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shrink-0">
                <Shield size={28} className="text-amber-900/60 group-hover:text-amber-700 transition-colors" />
              </div>
              <div>
                <p className="font-mono text-xs text-stone-600 mb-1"># {b.id}</p>
                <div className="flex items-center gap-2 mb-1">
                  <Coins size={12} className="text-amber-600" />
                  <p className="text-xs text-amber-500 font-bold uppercase tracking-widest">Wager: {b.amount}</p>
                </div>
                <p className="text-sm text-stone-400 italic">
                  {b.status === 'accepted'
                    ? <>Rival: <span className="font-mono text-xs text-amber-800">{b.opponent}</span></>
                    : <span className="text-stone-600">Awaiting a rival…</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className={`text-xs font-bold uppercase tracking-widest italic ${
                b.status === 'accepted' ? 'text-amber-500' :
                b.status === 'finished' ? 'text-green-700' : 'text-stone-600'
              }`}>
                {b.status === 'accepted' ? <><Flame size={12} className="inline" /> Steel is Drawn</> :
                 b.status === 'finished' ? <><Sword size={12} className="inline" /> Finished</> : <><Clock size={12} className="inline" /> Awaiting Rivals</>}
              </span>

              {b.status === 'accepted' ? (
                <button onClick={() => handleStartFight(b)}
                  className="px-6 py-2.5 bg-amber-900 hover:bg-amber-800 text-amber-100 border-b-4 border-amber-950 font-bold uppercase text-xs transition-all shadow-lg active:border-b-0 active:translate-y-0.5">
                  Commence
                </button>
              ) : (
                <button disabled
                  className="px-6 py-2.5 bg-stone-900 text-stone-600 border border-stone-800 font-bold uppercase text-xs cursor-not-allowed">
                  Commence
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {modal?.type === 'fighter' && (
        <FighterModal
          message={modal.mode === 'create' ? 'You are creating a challenge' : 'You are starting the fight'}
          value={wage}
          initial={modal.report?.savedFighter}
          onConfirm={(f) => {
            if (modal.mode === 'create') submitCreateChallenge(f);
            else submitStartFight(f, modal.report);
          }}
          onCancel={() => setModal(null)}
        />
      )}

      {modal?.type === 'fight' && (
        <FightModal battle={modal.battle} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
