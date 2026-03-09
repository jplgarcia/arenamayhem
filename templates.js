import React, { useState, useEffect } from 'react';
import { 
  Sword, 
  Wallet, 
  History, 
  LayoutDashboard, 
  ShieldAlert, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send,
  Zap,
  CheckCircle2,
  Trophy,
  Info
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [walletConnected, setWalletConnected] = useState(false);
  const [balance, setBalance] = useState(0);
  const [userAddress, setUserAddress] = useState("");
  const [myBattles, setMyBattles] = useState([]);
  const [allChallenges, setAllChallenges] = useState([
    { id: 101, creator: "0x71...2b9", wager: 50, fighter: "Iron Golem", level: 12 },
    { id: 102, creator: "0x12...9a4", wager: 120, fighter: "Shadow Blade", level: 15 },
    { id: 103, creator: "0x55...3c1", wager: 15, fighter: "Cyber Monk", level: 8 },
  ]);

  // Mock User History
  const history = [
    { id: 1, opponent: "0x88...11a", result: "Victory", profit: "+45 MAYHEM", date: "2023-10-25" },
    { id: 2, opponent: "0x22...55b", result: "Loss", profit: "-30 MAYHEM", date: "2023-10-24" },
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
      fighter: "Neon Gladiator",
      status: "waiting", // 'waiting' or 'ready'
      opponent: null
    };
    setMyBattles([...myBattles, newBattle]);
    setActiveTab('my-battles');
  };

  // Nav Component
  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
        activeTab === id 
          ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-gray-100 font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0d0d0f] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-xl">
              <Sword className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Arena Mayhem
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {!walletConnected ? (
              <button 
                onClick={connectWallet}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-transform active:scale-95"
              >
                <Wallet size={18} />
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-4 bg-gray-900/50 p-1.5 pr-4 rounded-full border border-gray-800">
                <div className="bg-gray-800 px-3 py-1 rounded-full text-xs font-mono text-purple-400">
                  {userAddress}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{balance.toFixed(2)} MAYHEM</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex flex-col gap-2 shrink-0">
          <NavItem id="about" icon={Info} label="About" />
          <NavItem id="assets" icon={Wallet} label="Assets" />
          <NavItem id="my-battles" icon={LayoutDashboard} label="My Battles" />
          <NavItem id="all-challenges" icon={Sword} label="All Challenges" />
          <NavItem id="history" icon={History} label="History" />
          
          <div className="mt-8 p-4 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl">
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Quick Action</p>
            <button 
              onClick={createBattle}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Plus size={18} />
              Create Battle
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {activeTab === 'about' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <section className="relative overflow-hidden rounded-3xl bg-gray-900 border border-gray-800 p-12">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center" />
                <div className="relative z-10 max-w-lg">
                  <h2 className="text-4xl font-black mb-4">The Ultimate Crypto Gladiator Simulation</h2>
                  <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                    Arena Mayhem is a zero-player combat simulator where strategy meets decentralized finance. 
                    Design your fighters, set your stakes, and watch them fight for glory on the blockchain.
                  </p>
                </div>
              </section>

              <div className="grid grid-cols-3 gap-6">
                {[
                  { title: "Design", desc: "Build your champion with unique stats and gear." },
                  { title: "Wager", desc: "Stake MAYHEM tokens against other players." },
                  { title: "Watch", desc: "The fight is automated. Skill points decide the fate." }
                ].map((item, i) => (
                  <div key={i} className="bg-[#0d0d0f] border border-gray-800 p-6 rounded-2xl">
                    <h3 className="text-purple-400 font-bold mb-2 uppercase text-xs tracking-widest">{item.title}</h3>
                    <p className="text-gray-300 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-900/30 border border-purple-500/20 p-8 rounded-3xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Zap className="text-yellow-400" /> How to Play
                </h3>
                <ol className="space-y-4">
                  {[
                    "Connect your MetaMask wallet securely.",
                    "Deposit ERC-20 tokens (MAYHEM) via the Assets panel.",
                    "Create a challenge in My Battles and define your fighter's build.",
                    "Wait for an opponent or accept an existing challenge in All Challenges.",
                    "Launch the battle and claim your winnings."
                  ].map((step, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <span className="bg-gray-800 text-purple-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1">{i+1}</span>
                      <p className="text-gray-400">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-900/40 to-black p-8 rounded-3xl border border-purple-500/20">
                  <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold">Total Balance</p>
                  <h3 className="text-4xl font-black mb-6 italic">{balance} <span className="text-purple-500">MAYHEM</span></h3>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-white text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                      <ArrowDownLeft size={18} /> Deposit
                    </button>
                    <button className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-gray-700">
                      <ArrowUpRight size={18} /> Withdraw
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 flex flex-col justify-center">
                  <h4 className="font-bold mb-4 flex items-center gap-2"><Send size={18} className="text-blue-400" /> Transfer Tokens</h4>
                  <div className="space-y-3">
                    <input type="text" placeholder="Recipient Address (0x...)" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-colors" />
                    <input type="number" placeholder="Amount" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-colors" />
                    <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all">Send Now</button>
                  </div>
                </div>
              </div>

              <div className="bg-[#0d0d0f] rounded-3xl border border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                  <h4 className="font-bold">Available Vouchers</h4>
                  <span className="text-xs text-gray-500 italic">Unclaimed rewards from battle victories</span>
                </div>
                <div className="p-12 flex flex-col items-center justify-center text-gray-500 italic">
                  <Trophy size={48} className="mb-4 opacity-20" />
                  <p>No pending vouchers. Go win some fights!</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'my-battles' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black uppercase italic">My Battles</h2>
                  <p className="text-gray-500 text-sm">Manage your created arena challenges</p>
                </div>
              </div>

              {myBattles.length === 0 ? (
                <div className="bg-gray-900/20 border-2 border-dashed border-gray-800 rounded-3xl p-20 flex flex-col items-center">
                  <ShieldAlert size={48} className="text-gray-700 mb-4" />
                  <p className="text-gray-500 font-medium">You haven't created any battles yet.</p>
                  <button onClick={createBattle} className="mt-4 text-purple-400 hover:text-purple-300 font-bold underline">Create your first challenge</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {myBattles.map((battle) => (
                    <div key={battle.id} className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl flex items-center justify-between group hover:border-purple-500/50 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-white/5">
                          <Sword size={32} className="text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{battle.fighter}</h4>
                          <p className="text-xs text-purple-400 font-bold uppercase">Wager: {battle.wager} MAYHEM</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                          <span className={`text-sm font-bold flex items-center gap-1.5 justify-end ${battle.status === 'waiting' ? 'text-yellow-500' : 'text-green-500'}`}>
                            {battle.status === 'waiting' ? (
                              <> <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" /> Waiting for Challenger </>
                            ) : (
                              <> <CheckCircle2 size={14} /> Ready to Fight </>
                            )}
                          </span>
                        </div>
                        
                        {battle.status === 'waiting' ? (
                          <button className="px-6 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm font-bold cursor-not-allowed">
                            Start Battle
                          </button>
                        ) : (
                          <button className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(147,51,234,0.4)]">
                            Start Battle
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
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div>
                <h2 className="text-2xl font-black uppercase italic">All Challenges</h2>
                <p className="text-gray-500 text-sm">Accept challenges from other players and build your counter-fighter</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allChallenges.map((challenge) => (
                  <div key={challenge.id} className="bg-[#0d0d0f] border border-gray-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-mono text-[10px] text-gray-400 border border-gray-700">
                          ID
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Creator</p>
                          <p className="text-sm font-mono text-blue-400 font-bold">{challenge.creator}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-black">Wager</p>
                        <p className="text-xl font-black italic text-white">{challenge.wager} <span className="text-xs not-italic text-gray-400">MAYHEM</span></p>
                      </div>
                    </div>

                    <div className="bg-black/40 rounded-xl p-4 mb-4 border border-gray-800/50">
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-400">Opponent Fighter</span>
                        <span className="font-bold text-purple-400">{challenge.fighter}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Base Level</span>
                        <span className="font-bold">Lvl {challenge.level}</span>
                      </div>
                    </div>

                    <button className="w-full bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/30 py-3 rounded-xl font-bold transition-all">
                      Accept Challenge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div>
                <h2 className="text-2xl font-black uppercase italic">Battle History</h2>
                <p className="text-gray-500 text-sm">Review your past combat performance</p>
              </div>

              <div className="bg-[#0d0d0f] rounded-3xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-900/50 border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Date</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Opponent</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Result</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-right">Profit/Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {history.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-800/20 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-400">{row.date}</td>
                        <td className="px-6 py-4 text-sm font-mono text-blue-400">{row.opponent}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                            row.result === 'Victory' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {row.result}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold text-right ${
                          row.profit.startsWith('+') ? 'text-green-500' : 'text-red-500'
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
      <footer className="fixed bottom-0 w-full bg-[#0d0d0f] border-t border-gray-800 px-6 py-2 flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Network: Polygon Mainnet</span>
          <span className="flex items-center gap-1 text-purple-400 italic">Arena Mayhem v1.0.4-beta</span>
        </div>
        <div>
          &copy; 2024 MAYHEM LABS
        </div>
      </footer>
    </div>
  );
};

export default App;