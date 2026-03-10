'use client';

import { useState } from 'react';

export interface Boons {
  hp: number; pow: number; skl: number; spd: number; lck: number; def: number; res: number;
}

export interface Fighter {
  name: string;
  element: string;
  boons: Boons;
  seed: string;
}

interface Props {
  message: string;
  value?: number | string;
  initial?: Partial<Fighter>;
  locked?: boolean;          // true = cached fighter, all fields read-only
  onConfirm: (fighter: Fighter) => void;
  onCancel: () => void;
}

// ── Constants (must match arena.py) ──────────────────────────────────────────
const MAX_BOONS = 10;
const BASE: Record<keyof Boons, number> = { hp:75, pow:15, skl:15, spd:15, lck:15, def:15, res:15 };
const BONUS: Record<keyof Boons, number> = { hp:7, pow:2, skl:4, spd:1, lck:5, def:3, res:3 };
const STAT_LABELS: Record<keyof Boons, string> = {
  hp:'HP', pow:'POW', skl:'SKL', spd:'SPD', lck:'LCK', def:'DEF', res:'RES',
};

const ELEMENTS = [
  { id:'fire',    label:'Fire',    beats:'Ice',     weak:'Water'   },
  { id:'water',   label:'Water',   beats:'Fire',    weak:'Thunder' },
  { id:'thunder', label:'Thunder', beats:'Water',   weak:'Earth'   },
  { id:'earth',   label:'Earth',   beats:'Thunder', weak:'Wind'    },
  { id:'wind',    label:'Wind',    beats:'Earth',   weak:'Ice'     },
  { id:'ice',     label:'Ice',     beats:'Wind',    weak:'Fire'    },
  { id:'light',   label:'Light',   beats:'Dark',    weak:'—'        },
  { id:'dark',    label:'Dark',    beats:'Light',   weak:'—'        },
];

const EMPTY_BOONS: Boons = { hp:0, pow:0, skl:0, spd:0, lck:0, def:0, res:0 };

export default function FighterModal({ message, value, initial, locked = false, onConfirm, onCancel }: Props) {
  const [name, setName]       = useState(initial?.name ?? '');
  const [element, setElement] = useState(initial?.element ?? 'fire');
  const [boons, setBoons]     = useState<Boons>(initial?.boons ?? EMPTY_BOONS);
  const [seed, setSeed]       = useState(initial?.seed ?? crypto.randomUUID());

  const used      = (Object.values(boons) as number[]).reduce((a, b) => a + b, 0);
  const remaining = MAX_BOONS - used;

  const add = (stat: keyof Boons) => {
    if (remaining <= 0) return;
    setBoons((p) => ({ ...p, [stat]: p[stat] + 1 }));
  };
  const sub = (stat: keyof Boons) => {
    if (boons[stat] <= 0) return;
    setBoons((p) => ({ ...p, [stat]: p[stat] - 1 }));
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { alert('Name must be set'); return; }
    onConfirm({ name: name.trim(), element, boons, seed });
  }

  const selectedElem = ELEMENTS.find((el) => el.id === element);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 overflow-y-auto py-6">
      <div className="bg-[#14110f] border-2 border-stone-800 p-8 w-full max-w-lg shadow-2xl relative overflow-hidden mx-4">
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-amber-900" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-amber-900" />

        <h2 className="text-amber-600 text-xl font-black uppercase italic tracking-wider mb-1">{message}</h2>
        {value !== undefined && (
          <p className="text-stone-500 text-xs mb-5 uppercase tracking-widest">Wager: {value} tokens</p>
        )}

        <form onSubmit={submit} className="flex flex-col gap-5">
          {/* Name + Seed on same row */}
          <div className="flex gap-3">
            <label className="flex flex-col gap-1.5 flex-1">
              <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Warrior Name</span>
              <input
                readOnly={locked}
                disabled={locked}
                className={`bg-stone-950 border border-stone-700 px-4 py-2.5 font-mono focus:outline-none focus:border-amber-900 ${
                  locked ? 'text-stone-500 cursor-not-allowed' : 'text-stone-200'
                }`}
                value={name} onChange={(e) => setName(e.target.value)} required
              />
            </label>
            <div className="flex flex-col gap-1.5 w-32">
              <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Seed</span>
              {!locked ? (
                <div className="flex gap-1 h-full">
                  <input title={seed}
                    className="w-0 flex-1 bg-stone-950 border border-stone-700 px-2 py-2.5 text-stone-400 font-mono text-[10px] truncate focus:outline-none focus:border-amber-900"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                  />
                  <button type="button" onClick={() => setSeed(crypto.randomUUID())}
                    className="px-2 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-400 text-xs transition-all">
                    ↺
                  </button>
                </div>
              ) : (
                <div className="flex items-center h-full">
                  <span className="text-[10px] text-stone-700 font-mono italic">hidden</span>
                </div>
              )}
            </div>
          </div>

          {/* Element */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Element</span>
            <div className="grid grid-cols-4 gap-2">
              {ELEMENTS.map((el) => (
                <button
                  key={el.id} type="button"
                  disabled={locked}
                  onClick={() => !locked && setElement(el.id)}
                  className={`px-2 py-2.5 text-xs font-bold uppercase tracking-wider border transition-all ${
                    element === el.id
                      ? 'bg-amber-900 border-amber-700 text-amber-100'
                      : locked
                        ? 'bg-stone-900 border-stone-800 text-stone-600 cursor-not-allowed'
                        : 'bg-stone-900 border-stone-700 text-stone-400 hover:border-stone-500'
                  }`}
                >
                  {el.label}
                </button>
              ))}
            </div>
            {selectedElem && (
              <p className="text-[10px] text-stone-600 uppercase tracking-widest mt-1">
                <span className="text-green-700">▲ {selectedElem.beats}</span>
                {selectedElem.weak !== '—' && <span className="text-red-800 ml-4">▼ {selectedElem.weak}</span>}
              </p>
            )}
          </div>

          {/* Boon budget */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Boon Points</span>
              <span className={`text-xs font-bold font-mono ${remaining === 0 ? 'text-amber-600' : 'text-stone-400'}`}>
                {used} / {MAX_BOONS} used &nbsp;·&nbsp; {remaining} left
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: MAX_BOONS }).map((_, i) => (
                <div key={i} className={`h-2 flex-1 ${i < used ? 'bg-amber-700' : 'bg-stone-800'}`} />
              ))}
            </div>
          </div>

          {/* Boon sliders */}
          <div className="grid grid-cols-1 gap-2">
            {(Object.keys(BASE) as (keyof Boons)[]).map((stat) => {
              const total = BASE[stat] + BONUS[stat] * boons[stat];
              return (
                <div key={stat} className="flex items-center gap-3 bg-stone-900/50 px-4 py-2.5 border border-stone-800">
                  <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest w-8">{STAT_LABELS[stat]}</span>
                  <span className="text-[10px] text-stone-700 w-10 font-mono">base {BASE[stat]}</span>
                  <span className="text-xs text-amber-700 font-bold font-mono w-12">
                    +{BONUS[stat] * boons[stat]}
                  </span>
                  <span className="text-sm text-stone-200 font-bold font-mono w-8">{total}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <button type="button" onClick={() => sub(stat)}
                      className={`w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-sm flex items-center justify-center border border-stone-700 disabled:opacity-30 ${locked ? 'cursor-not-allowed' : ''}`}
                      disabled={boons[stat] <= 0 || locked}>−</button>
                    <span className="w-5 text-center text-stone-300 font-mono text-sm">{boons[stat]}</span>
                    <button type="button" onClick={() => add(stat)}
                      className={`w-7 h-7 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-sm flex items-center justify-center border border-stone-700 disabled:opacity-30 ${locked ? 'cursor-not-allowed' : ''}`}
                      disabled={remaining <= 0 || locked}>+</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onCancel}
              className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-400 font-bold border-b-4 border-stone-900 uppercase tracking-widest text-xs transition-all active:border-b-0 active:translate-y-0.5">
              Retreat
            </button>
            <button type="submit"
              className="px-5 py-2.5 bg-amber-900 hover:bg-amber-800 text-amber-100 font-bold border-b-4 border-amber-950 uppercase tracking-widest text-xs transition-all active:border-b-0 active:translate-y-0.5">
              Forge &amp; Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
