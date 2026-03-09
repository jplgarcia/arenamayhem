import React, { useState, useEffect } from 'react';
import { 
  Sword, 
  Wallet, 
  History, 
  LayoutDashboard, 
  ShieldAlert, 
  Plus, 
  Coins, 
  Skull, 
  Scroll,
  Shield,
  Flame,
  Trophy,
  Info,
  ChevronRight,
  GanttChartSquare
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [walletConnected, setWalletConnected] = useState(false);
  const [balance, setBalance] = useState(0);
  const [userAddress, setUserAddress] = useState("");
  const [myBattles, setMyBattles] = useState([]);
  const [allChallenges, setAllChallenges] = useState([
    { id: 101, creator: "0x71...2b9", wager: 50, fighter: "The Iron Golem", level: 12, archetype: "Heavy" },
    { id: 102, creator: "0x12...9a4", wager: 120, fighter: "Shadow Stalker", level: 15, archetype: "Assassin" },
    { id: 103, creator: "0x55...3c1", wager: 15, fighter: "Blind Monk", level: 8, archetype: "Brawler" },
  ]);

  const history = [
    { id: 1, opponent: "0x88...11a", result: "Victory", profit: "+45 GOLD", date: "XIX Oct" },
    { id: 2, opponent: "0x22...55b", result: "Defeat", profit: "-30 GOLD", date: "XVIII Oct" },
  ];

  const connectWallet = () => {
    setWalletConnected(true);
    setUserAddress("0x4f...9E21");
    setBalance(250.00);
  };

  const createBattle = () => {
    const newBattle = {
      id: Date.now(),
      wager: 25,
      fighter: "Unknown Knight",
      status: "waiting",
      opponent: null
    };
    setMyBattles([...myBattles, newBattle]);
    setActiveTab('my-battles');
  };

  // Rustic Navigation Item
  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`group relative flex items-center gap-3 px-6 py-4 transition-all duration-300 ${
        activeTab === id 
          ? 'text-amber-200' 
          : 'text-stone-500 hover:text-stone-300'
      }`}
    >
      {activeTab === id && (
        <div className="absolute left-0 w-1 h-full bg-amber-700 shadow-[0_0_10px_#78350f]" />
      )}
      <Icon size={20} className={activeTab === id ? "animate-pulse" : ""} />
      <span className="font-serif tracking-widest uppercase text-sm">{label}</span>
      <ChevronRight size={14} className={`ml-auto opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === id ? 'opacity-100' : ''}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#1a1614] text-stone-200 font-serif selection:bg-amber-900 selection:text-white">
      {/* Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] z-50"></div>

      {/* Header */}
      <header className="border-b-4 border-double border-stone-800 bg-[#14110f] sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-amber-900 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-stone-900 border-2 border-stone-700 p-3 rounded-md transform rotate-3">
                <Sword className="text-amber-600" size={32} />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-widest uppercase italic text-stone-100 drop-shadow-lg">
                Arena <span className="text-amber-700">Mayhem</span>
              </h1>
              <p className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-sans">Blockchain Blood & Steel</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {!walletConnected ? (
              <button 
                onClick={connectWallet}
                className="relative bg-amber-900 hover:bg-amber-800 text-amber-100 px-8 py-3 font-bold border-b-4 border-amber-950 active:border-b-0 active:translate-y-1 transition-all shadow-lg overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/5 -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-700"></div>
                <span className="flex items-center gap-2 tracking-tighter uppercase">
                  <Wallet size={18} /> Connect Signet
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end leading-none">
                  <span className="text-[10px] text-stone-500 uppercase font-sans mb-1 font-bold">Purse Balance</span>
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-xl italic">
                    <Coins size={20} />
                    {balance.toFixed(0)} <span className="text-xs">GOLD</span>
                  </div>
                </div>
                <div className="h-10 w-px bg-stone-800" />
                <div className="bg-stone-900 border border-stone-800 px-4 py-2 rounded flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-900 animate-pulse border border-green-500" />
                  <span className="text-xs font-mono text-stone-400">{userAddress}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-10 flex gap-12">
        {/* Sidebar */}
        <aside className="w-72 flex flex-col shrink-0">
          <div className="bg-[#14110f] border-2 border-stone-800 rounded-sm overflow-hidden divide-y divide-stone-800/50 shadow-xl">
            <NavItem id="about" icon={Info} label="The Lore" />
            <NavItem id="assets" icon={Coins} label="The Vault" />
            <NavItem id="my-battles" icon={Shield} label="My Fighters" />
            <NavItem id="all-challenges" icon={Sword} label="The Pit" />
            <NavItem id="history" icon={Scroll} label="Chronicles" />
          </div>
          
          <div className="mt-10 relative">
            <div className="absolute inset-0 bg-amber-900/10 blur-xl"></div>
            <button 
              onClick={createBattle}
              className="relative w-full bg-[#2a120a] hover:bg-[#3d1a0e] border-2 border-amber-900 text-amber-100 py-5 font-bold flex flex-col items-center justify-center gap-2 transition-all group shadow-2xl"
            >
              <Plus size={24} className="group-hover:rotate-90 transition-transform" />
              <span className="tracking-[0.2em] uppercase text-xs">Forge a Challenge</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-20">
          {activeTab === 'about' && (
            <div className="space-y-12 animate-in fade-in duration-700">
              <section className="relative rounded-sm border-2 border-stone-800 bg-[#14110f] p-16 overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 grayscale contrast-125 bg-[url('https://images.unsplash.com/photo-1599423083145-257a09800041?q=80&w=1200')] bg-cover bg-center" />
                <div className="relative z-10">
                  <h2 className="text-5xl font-black mb-6 uppercase italic text-stone-100 tracking-tighter">Blood, Dust & <span className="text-amber-800 underline decoration-double">Wagers</span></h2>
                  <p className="text-stone-400 text-xl mb-8 leading-relaxed max-w-2xl font-serif">
                    The Arena is not for the faint of heart. It is a realm where code meets cold steel, and your gold speaks louder than your prayers. 
                    Place your tokens on automated gladiators and watch destiny unfold in the pit.
                  </p>
                  <div className="flex gap-4">
                    <div className="h-1 w-20 bg-amber-900 rounded-full" />
                    <div className="h-1 w-4 bg-amber-900 rounded-full" />
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: "Forge", desc: "Craft your gladiator's gear and attributes from ancient blueprints." },
                  { title: "Stakes", desc: "Commit your gold to the blood-stained soil of the pit." },
                  { title: "Watch", desc: "No men control the steel once the bell tolls. Fate is calculated." }
                ].map((item, i) => (
                  <div key={i} className="bg-stone-900/40 border border-stone-800 p-8 relative overflow-hidden group hover:border-amber-900 transition-colors">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Skull size={100} />
                    </div>
                    <h3 className="text-amber-700 font-bold mb-4 uppercase text-sm tracking-widest">{item.title}</h3>
                    <p className="text-stone-400 text-sm leading-relaxed italic">"{item.desc}"</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#14110f] border border-stone-800 p-10 shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-stone-700 to-transparent"></div>
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 italic uppercase tracking-widest">
                  <Flame size={24} className="text-amber-700" /> The Warrior's Path
                </h3>
                <div className="grid grid-cols-1 gap-8">
                  {[
                    "Bond your digital signet (MetaMask).",
                    "Offer your gold to the Great Vault in the Assets chamber.",
                    "Summon a fighter and define their attributes in 'My Fighters'.",
                    "Sought out rivals in 'The Pit' or wait for a challenger.",
                    "Witness the carnage and claim the spoils of war."
                  ].map((step, i) => (
                    <div key={i} className="flex gap-6 items-center group">
                      <span className="bg-stone-900 border border-stone-700 text-amber-700 w-10 h-10 flex items-center justify-center text-lg font-bold shrink-0 shadow-lg group-hover:scale-110 transition-transform">{i+1}</span>
                      <p className="text-stone-300 font-serif italic text-lg">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#14110f] border-2 border-stone-800 p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-900"></div>
                  <p className="text-stone-500 text-xs mb-2 uppercase tracking-[0.3em] font-bold">Total Loot</p>
                  <h3 className="text-5xl font-black mb-8 italic text-amber-500 drop-shadow-[0_2px_10px_rgba(180,83,9,0.3)]">
                    {balance} <span className="text-xl text-stone-600">GOLD</span>
                  </h3>
                  <div className="flex gap-4">
                    <button className="flex-1 bg-amber-900 hover:bg-amber-800 text-amber-100 py-4 font-bold border-b-4 border-amber-950 flex items-center justify-center gap-3 transition-all">
                      <ArrowDownLeft size={18} /> Offer Gold
                    </button>
                    <button className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 py-4 font-bold border-b-4 border-stone-950 flex items-center justify-center gap-3 transition-all">
                      <ArrowUpRight size={18} /> Retrieve
                    </button>
                  </div>
                </div>

                <div className="bg-stone-900/40 border border-stone-800 p-10 shadow-xl">
                  <h4 className="font-bold mb-6 flex items-center gap-3 text-stone-300 uppercase tracking-widest italic border-b border-stone-800 pb-4">
                    <Send size={18} className="text-stone-500" /> Send Tribute
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-500 uppercase font-bold ml-1">Recipient Mark</label>
                      <input type="text" placeholder="0x..." className="w-full bg-stone-950 border border-stone-800 p-4 text-sm focus:border-amber-900 outline-none transition-colors italic font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-500 uppercase font-bold ml-1">Gold Amount</label>
                      <input type="number" placeholder="0" className="w-full bg-stone-950 border border-stone-800 p-4 text-sm focus:border-amber-900 outline-none transition-colors font-bold" />
                    </div>
                    <button className="w-full bg-stone-800 hover:bg-amber-900 py-4 font-bold transition-all text-sm uppercase tracking-widest border border-stone-700">Dispatch Gold</button>
                  </div>
                </div>
              </div>

              <div className="bg-[#14110f] border-2 border-stone-800 shadow-2xl">
                <div className="px-8 py-6 border-b border-stone-800 flex justify-between items-center bg-stone-900/50">
                  <h4 className="font-bold uppercase tracking-widest text-sm italic">Royal Vouchers</h4>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-950/30 px-3 py-1 border border-amber-900/50">Unclaimed War Spoils</span>
                </div>
                <div className="p-20 flex flex-col items-center justify-center text-stone-600 italic grayscale opacity-30">
                  <Trophy size={64} className="mb-6" />
                  <p className="text-xl">The scrolls of victory are empty.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'my-battles' && (
            <div className="space-y-8 animate-in slide-in-from-right-6">
              <div className="flex justify-between items-end border-b-2 border-stone-800 pb-6">
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">My Fighters</h2>
                  <p className="text-stone-500 text-sm italic">Manage your stable of arena contenders</p>
                </div>
              </div>

              {myBattles.length === 0 ? (
                <div className="bg-[#14110f] border-2 border-dashed border-stone-800 p-24 flex flex-col items-center shadow-inner">
                  <ShieldAlert size={64} className="text-stone-800 mb-6" />
                  <p className="text-stone-500 text-xl italic font-serif">Your barracks are empty, traveler.</p>
                  <button onClick={createBattle} className="mt-6 text-amber-700 hover:text-amber-600 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                    <Plus size={16} /> Summon a Knight
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {myBattles.map((battle) => (
                    <div key={battle.id} className="bg-[#14110f] border-2 border-stone-800 p-8 flex items-center justify-between group hover:border-amber-900/50 transition-all shadow-xl">
                      <div className="flex items-center gap-8">
                        <div className="relative">
                          <div className="absolute inset-0 bg-amber-900/10 blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="w-20 h-20 bg-stone-900 border-2 border-stone-800 flex items-center justify-center relative rotate-3 group-hover:rotate-0 transition-transform">
                            <Shield size={40} className="text-amber-900/50 group-hover:text-amber-700 transition-colors" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-2xl font-black italic uppercase text-stone-100">{battle.fighter}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Coins size={14} className="text-amber-700" />
                            <p className="text-xs text-amber-600 font-bold uppercase tracking-widest">Wagered: {battle.wager} Gold</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-10">
                        <div className="text-right">
                          <p className="text-[10px] text-stone-600 uppercase font-black tracking-widest mb-1">Status</p>
                          <span className={`text-sm font-bold uppercase italic tracking-tighter flex items-center gap-2 justify-end ${battle.status === 'waiting' ? 'text-stone-500' : 'text-green-600'}`}>
                            {battle.status === 'waiting' ? (
                              <> <Flame size={14} className="animate-pulse text-amber-900" /> Awaiting Rivals </>
                            ) : (
                              <> <CheckCircle2 size={16} /> Steel is Drawn </>
                            )}
                          </span>
                        </div>
                        
                        {battle.status === 'waiting' ? (
                          <button className="px-8 py-3 bg-stone-900 text-stone-600 border border-stone-800 rounded-sm font-bold uppercase text-xs cursor-not-allowed">
                            Commence
                          </button>
                        ) : (
                          <button className="px-8 py-3 bg-amber-900 hover:bg-amber-800 text-amber-100 border-b-4 border-amber-950 font-bold uppercase text-xs transition-all shadow-lg active:border-b-0 active:translate-y-1">
                            Commence
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'all-challenges' && (
            <div className="space-y-8 animate-in slide-in-from-right-6">
              <div className="border-b-2 border-stone-800 pb-6">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">The Pit</h2>
                <p className="text-stone-500 text-sm italic">Accept a challenge and prepare for the slaughter</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allChallenges.map((challenge) => (
                  <div key={challenge.id} className="bg-[#14110f] border-2 border-stone-800 p-8 shadow-2xl relative group overflow-hidden">
                    <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                      <Sword size={120} />
                    </div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-stone-900 border border-stone-700 flex items-center justify-center text-stone-500 font-mono text-xs">
                          {challenge.id}
                        </div>
                        <div>
                          <p className="text-[10px] text-stone-600 uppercase font-bold">Signet</p>
                          <p className="text-sm font-mono text-amber-800 font-bold">{challenge.creator}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-stone-600 uppercase font-black">Pot</p>
                        <p className="text-3xl font-black italic text-stone-100 leading-none">{challenge.wager} <span className="text-[10px] not-italic text-stone-600">GOLD</span></p>
                      </div>
                    </div>

                    <div className="bg-stone-950/50 p-6 mb-6 border border-stone-800 flex justify-between items-center italic">
                      <div>
                        <p className="text-[10px] text-stone-600 uppercase font-bold not-italic">Rival Fighter</p>
                        <p className="text-xl font-black text-amber-700 uppercase tracking-tighter">{challenge.fighter}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-stone-600 uppercase font-bold not-italic">Power</p>
                        <p className="text-xl font-black text-stone-400">Rank {challenge.level}</p>
                      </div>
                    </div>

                    <button className="w-full bg-transparent hover:bg-stone-800 text-stone-400 hover:text-stone-100 border border-stone-700 py-4 font-bold transition-all uppercase tracking-[0.2em] text-xs">
                      Enter the Fray
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-8 animate-in slide-in-from-right-6">
              <div className="border-b-2 border-stone-800 pb-6">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">The Chronicles</h2>
                <p className="text-stone-500 text-sm italic">The ink dries upon your legacy</p>
              </div>

              <div className="bg-[#14110f] border-2 border-stone-800 shadow-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-stone-900 text-stone-500">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em]">Era</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em]">Rival Signet</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em]">Fate</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-right">Spoils</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {history.map((row) => (
                      <tr key={row.id} className="hover:bg-stone-800/10 transition-colors group">
                        <td className="px-8 py-6 text-sm text-stone-500 font-mono">{row.date}</td>
                        <td className="px-8 py-6 text-sm font-mono text-stone-400 group-hover:text-amber-800 transition-colors">{row.opponent}</td>
                        <td className="px-8 py-6">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            row.result === 'Victory' ? 'text-green-800' : 'text-red-900'
                          }`}>
                            {row.result}
                          </span>
                        </td>
                        <td className={`px-8 py-6 text-lg font-black italic text-right ${
                          row.profit.startsWith('+') ? 'text-green-800' : 'text-red-900'
                        }`}>
                          {row.profit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Footer / Status Bar */}
      <footer className="fixed bottom-0 w-full bg-[#14110f] border-t-2 border-stone-800 px-8 py-3 flex justify-between items-center text-[10px] text-stone-600 uppercase tracking-[0.3em] font-bold">
        <div className="flex gap-8">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-900 rounded-full border border-green-500" /> Realm: Polygon Sigil</span>
          <span className="flex items-center gap-2 text-stone-500">Echoes: 12ms</span>
        </div>
        <div className="flex items-center gap-2">
          <GanttChartSquare size={12} className="text-amber-900" />
          <span>V1.0.4 - Scribe Mode</span>
        </div>
      </footer>
    </div>
  );
};

export default App;