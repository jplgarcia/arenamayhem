'use client';

import { useState } from 'react';

export interface Fighter {
  name: string;
  weapon: string;
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

interface Props {
  message: string;
  value?: number | string;
  initial?: Partial<Fighter>;
  onConfirm: (fighter: Fighter) => void;
  onCancel: () => void;
}

const WEAPONS = ['sword', 'axe', 'lance'];

export default function FighterModal({ message, value, initial, onConfirm, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [weapon, setWeapon] = useState(initial?.weapon ?? 'sword');
  const [hp, setHp] = useState(initial?.hp ?? 25);
  const [atk, setAtk] = useState(initial?.atk ?? 25);
  const [def, setDef] = useState(initial?.def ?? 25);
  const [spd, setSpd] = useState(initial?.spd ?? 25);

  const total = hp + atk + def + spd;

  function validate(): string | null {
    if (!name.trim()) return 'Name must be set';
    if ([hp, atk, def, spd].some((s) => s < 1)) return 'All stats must be at least 1';
    if ([hp, atk, def, spd].some((s) => s > 40)) return 'No stat can exceed 40';
    if (total > 100) return `Sum of stats (${total}) cannot exceed 100`;
    return null;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { alert(err); return; }
    onConfirm({ name: name.trim(), weapon, hp, atk, def, spd });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#14110f] border-2 border-stone-800 p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-amber-900" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-amber-900" />

        <h2 className="text-amber-600 text-xl font-black uppercase italic tracking-wider mb-1">{message}</h2>
        {value !== undefined && (
          <p className="text-stone-500 text-xs mb-5 uppercase tracking-widest">Wager: {value} tokens</p>
        )}

        <form onSubmit={submit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Warrior Name</span>
            <input
              className="bg-stone-950 border border-stone-700 px-4 py-2.5 text-stone-200 focus:outline-none focus:border-amber-900 font-mono"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Weapon of Choice</span>
            <select
              className="bg-stone-950 border border-stone-700 px-4 py-2.5 text-stone-200 focus:outline-none focus:border-amber-900 capitalize"
              value={weapon}
              onChange={(e) => setWeapon(e.target.value)}
            >
              {WEAPONS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {(['hp', 'atk', 'def', 'spd'] as const).map((stat) => {
              const val: number = stat === 'hp' ? hp : stat === 'atk' ? atk : stat === 'def' ? def : spd;
              const setter = stat === 'hp' ? setHp : stat === 'atk' ? setAtk : stat === 'def' ? setDef : setSpd;
              return (
                <label key={stat} className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">{stat} (1–40)</span>
                  <input
                    type="number" min={1} max={40}
                    className="bg-stone-950 border border-stone-700 px-4 py-2.5 text-stone-200 focus:outline-none focus:border-amber-900 font-mono"
                    value={val}
                    onChange={(e) => setter(Number(e.target.value))}
                    required
                  />
                </label>
              );
            })}
          </div>

          <p className={`text-xs font-bold uppercase tracking-widest ${total > 100 ? 'text-red-500' : 'text-stone-600'}`}>
            Stat total: {total} / 100
          </p>

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
