import { Sword, Flame } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl space-y-10">
      {/* Hero */}
      <section className="relative rounded-sm border-2 border-stone-800 bg-[#14110f] p-12 overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-5 bg-[url('/assets/img/arena.jpg')] bg-cover bg-center" />
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-4 uppercase italic text-stone-100 tracking-tighter">
            Blood, Dust &amp; <span className="text-amber-800 underline decoration-double">Wagers</span>
          </h2>
          <p className="text-stone-400 text-lg leading-relaxed max-w-2xl">
            The Arena is not for the faint of heart. Code meets cold steel, and your tokens speak louder than prayers.
            Automated gladiators clash inside a deterministic RISC-V machine — fair, transparent, tamper-proof.
          </p>
          <div className="flex gap-3 mt-6">
            <div className="h-1 w-20 bg-amber-900 rounded-full" />
            <div className="h-1 w-4 bg-amber-900 rounded-full" />
          </div>
        </div>
      </section>

      {/* How it works cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Forge',  desc: 'Craft your gladiator — choose weapons and allocate stat points wisely.' },
          { title: 'Stakes', desc: 'Commit ERC-20 tokens to the blood-stained soil of the pit.' },
          { title: 'Watch',  desc: 'No hand controls the steel once the bell tolls. Fate is calculated.' },
        ].map((item, i) => (
          <div key={i} className="bg-stone-900/40 border border-stone-800 p-7 relative overflow-hidden group hover:border-amber-900 transition-colors">
            <div className="absolute -right-3 -bottom-3 opacity-5 group-hover:opacity-10 transition-opacity"><Sword size={80} /></div>
            <h3 className="text-amber-700 font-bold mb-3 uppercase text-xs tracking-widest">{item.title}</h3>
            <p className="text-stone-400 text-sm leading-relaxed italic">"{item.desc}"</p>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="bg-[#14110f] border border-stone-800 p-10 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent" />
        <h3 className="text-xl font-bold mb-8 uppercase italic tracking-widest text-stone-200 flex items-center gap-3">
          <><Flame size={16} className="inline text-amber-700" /> The Warrior's Path</>
        </h3>
        <div className="grid gap-6">
          {[
            "Bond your digital signet (MetaMask).",
            "Offer tokens to the Great Vault — go to The Vault and deposit ERC-20.",
            "Forge a Challenge in My Fighters: set your wage and design your warrior.",
            "A rival accepts your challenge in The Pit and forges their own fighter.",
            "Return to My Fighters and start the match once an opponent has joined.",
            "Watch the carnage unfold and claim spoils via withdrawal vouchers.",
          ].map((step, i) => (
            <div key={i} className="flex gap-5 items-start group">
              <span className="bg-stone-900 border border-stone-700 text-amber-700 w-9 h-9 flex items-center justify-center text-sm font-bold shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                {i + 1}
              </span>
              <p className="text-stone-300 italic text-base pt-1">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stat breakdown */}
      <div className="bg-[#14110f] border border-stone-800 p-8 shadow-xl">
        <h3 className="text-xl font-bold mb-5 uppercase italic tracking-widest text-stone-200">Fighter Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[['HP', 'Hit points — how much punishment you survive.'],
            ['ATK', 'Attack power — how hard you strike.'],
            ['DEF', 'Defence — how much damage you absorb.'],
            ['SPD', 'Speed — who strikes first each round.']].map(([label, desc]) => (
            <div key={label} className="bg-stone-900/50 border border-stone-800 p-4">
              <p className="text-amber-600 font-black text-lg mb-1">{label}</p>
              <p className="text-stone-500 text-xs italic">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-stone-500 text-xs mt-4 italic">Sum of all four stats must not exceed 100.</p>
      </div>

      {/* Cartesi link */}
      <p className="text-stone-500 text-sm italic text-center">
        Powered by{' '}
        <a href="https://cartesi.io" target="_blank" rel="noreferrer"
          className="text-amber-700 underline hover:text-amber-500">
          Cartesi Rollups v2
        </a>
      </p>
    </div>
  );
}
