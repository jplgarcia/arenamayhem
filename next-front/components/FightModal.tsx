'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { BattleRecord } from '@/lib/rpc';
import { Sword } from 'lucide-react';

interface Props {
  battle: BattleRecord;
  onClose: () => void;
}

/**
 * FightModal – displays battle result and runs the JS fight animation.
 * fight.js is loaded globally in layout.tsx via <Script>.
 */
export default function FightModal({ battle, onClose }: Props) {
  const battleRef = useRef(battle);
  battleRef.current = battle;

  const startAnim = useCallback(() => {
    const w = window as any;
    if (typeof w.fight !== 'function') return;
    w.preload?.();
    // fight.js expects a `weapon` field for sprite selection.
    // New schema uses `element` — map to a default weapon sprite.
    const ELEM_TO_WEAPON: Record<string, string> = {
      fire: 'sword', water: 'axe', thunder: 'sword',
      earth: 'lance', wind: 'axe', ice: 'lance',
      light: 'sword', dark: 'axe',
    };
    const fighters = (battleRef.current.fighters ?? []).map((f: any) => ({
      ...f,
      weapon: f.weapon ?? ELEM_TO_WEAPON[f.element] ?? 'sword',
    }));
    w.fight(battleRef.current.rounds, fighters);
  }, []);

  useEffect(() => {
    // If fight.js is already loaded (common case), start immediately.
    // Otherwise poll until it appears (script still loading edge case).
    const w = window as any;
    if (typeof w.fight === 'function') {
      startAnim();
      return;
    }
    const interval = setInterval(() => {
      if (typeof (window as any).fight === 'function') {
        clearInterval(interval);
        startAnim();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [startAnim]);

  const winner = battle.winner
    ? typeof battle.winner === 'object' ? battle.winner.name : battle.winner
    : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="bg-[#14110f] border-2 border-stone-800 p-6 w-full max-w-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-amber-900" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-amber-900" />

        <h2 className="flex items-center gap-2 text-amber-600 text-2xl font-black uppercase italic tracking-wider mb-1"><Sword size={22} /> The Carnage</h2>
        <p className="text-stone-600 text-xs mb-5 uppercase tracking-widest font-bold">Duel #{battle.game_id}</p>

        {/* Arena canvas – 625×300 matches fight.js sprite layout */}
        <div className="overflow-x-auto">
          <div className="arena" style={{
            width: 625,
            height: 300,
            backgroundImage: "url('/assets/img/arena.jpg')",
            backgroundSize: 'cover',
            position: 'relative',
          }}>
            <div id="hp1-box" className="hp-box">
              <div id="hp1-bar" className="hp-bar" />
            </div>
            <div id="hp2-box" className="hp-box">
              <div id="hp2-bar" className="hp-bar" />
            </div>
            <div id="player1" className="fighter" />
            <div id="player2" className="fighter flipped right" />
          </div>
        </div>

        <div className="mt-5 text-center">
          <p className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mb-1">Victor</p>
          <p className="text-2xl font-black italic uppercase text-amber-500">{winner}</p>
        </div>

        {battle.rounds && battle.rounds.length > 0 && (
          <details className="mt-5">
            <summary className="cursor-pointer text-stone-600 hover:text-stone-400 text-xs uppercase tracking-widest font-bold">
              Round Log ({battle.rounds.length} rounds)
            </summary>
            <div className="mt-3 max-h-40 overflow-y-auto text-xs text-stone-600 space-y-1">
              {battle.rounds.map((r: any, i: number) => (
                <div key={i} className="bg-stone-950 border border-stone-800 px-3 py-1.5">
                  Round {i + 1}: {JSON.stringify(r)}
                </div>
              ))}
            </div>
          </details>
        )}

        <div className="mt-5 flex justify-end">
          <button onClick={onClose}
            className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-400 font-bold border-b-4 border-stone-900 uppercase tracking-widest text-xs transition-all active:border-b-0 active:translate-y-0.5">
            Leave the Pit
          </button>
        </div>
      </div>
    </div>
  );
}
