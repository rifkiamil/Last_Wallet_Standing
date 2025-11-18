import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AgentGrid } from './components/AgentGrid';
import { ControlPanel } from './components/ControlPanel';
import { StatsChart } from './components/StatsChart';
import { Agent, SimulationSettings, GameStats } from './types';
import { Users, TrendingDown, Activity, DollarSign } from 'lucide-react';

const INITIAL_SETTINGS: SimulationSettings = {
  agentCount: 100,
  initialBalance: 50,
  transactionsPerRound: 50,
  allowDebt: false,
  transactionAmount: 1
};

const App: React.FC = () => {
  // State
  const [agents, setAgents] = useState<Agent[]>([]);
  const [settings, setSettings] = useState<SimulationSettings>(INITIAL_SETTINGS);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(100); // ms delay
  const [round, setRound] = useState(0);
  
  // Refs for loop management
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize Game
  const initGame = useCallback(() => {
    const newAgents: Agent[] = Array.from({ length: settings.agentCount }, (_, i) => ({
      id: i + 1,
      balance: settings.initialBalance,
      active: true,
      peakBalance: settings.initialBalance,
      transactionCount: 0
    }));
    setAgents(newAgents);
    setRound(0);
    setIsRunning(false);
  }, [settings.agentCount, settings.initialBalance]);

  // Run once on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Handle side effects when settings change (specifically debt toggle)
  useEffect(() => {
    setAgents(currentAgents => currentAgents.map(agent => {
        // If debt is allowed, everyone is active (even if negative)
        if (settings.allowDebt) return { ...agent, active: true };
        
        // If debt is NOT allowed, anyone with <= 0 is immediately inactive
        if (agent.balance <= 0) return { ...agent, active: false };
        
        return agent;
    }));
  }, [settings.allowDebt]);

  // Simulation Step Logic
  const runRound = useCallback(() => {
    setAgents(currentAgents => {
      // Create a copy to mutate
      const nextAgents = [...currentAgents];
      
      // Determine who can participate
      let availableIndices: number[] = [];
      
      if (settings.allowDebt) {
        availableIndices = nextAgents.map((_, i) => i);
      } else {
        // Only active agents with positive balance can initiate or receive in a way that keeps them alive
        // Actually, anyone active can receive, but to keep it simple, we pick from active pool
        availableIndices = nextAgents
          .map((a, i) => (a.active && a.balance > 0) ? i : -1)
          .filter(i => i !== -1);
      }

      // If fewer than 2 agents can trade, stop
      if (availableIndices.length < 2) {
        setIsRunning(false);
        return nextAgents;
      }

      for (let t = 0; t < settings.transactionsPerRound; t++) {
        // Pick two distinct random agents from the available pool
        const idx1 = Math.floor(Math.random() * nextAgents.length);
        const idx2 = Math.floor(Math.random() * nextAgents.length);

        if (idx1 === idx2) continue;

        const agentA = nextAgents[idx1];
        const agentB = nextAgents[idx2];

        // Skip if agents are already out (double check for safety)
        if (!settings.allowDebt && (!agentA.active || !agentB.active)) continue;

        // Check viability based on rules
        const agentACanPay = settings.allowDebt || (agentA.balance >= settings.transactionAmount);
        const agentBCanPay = settings.allowDebt || (agentB.balance >= settings.transactionAmount);
        
        // If neither can pay, skip
        if (!agentACanPay && !agentBCanPay) continue;

        // Determine direction: 50/50 chance
        const direction = Math.random() > 0.5 ? 'AtoB' : 'BtoA';
        const amount = settings.transactionAmount;

        if (direction === 'AtoB') {
            if (settings.allowDebt || agentA.balance >= amount) {
                agentA.balance -= amount;
                agentB.balance += amount;
                agentA.transactionCount++;
                agentB.transactionCount++;
            }
        } else {
             if (settings.allowDebt || agentB.balance >= amount) {
                agentB.balance -= amount;
                agentA.balance += amount;
                agentA.transactionCount++;
                agentB.transactionCount++;
            }
        }

        // Update Active status immediately
        if (!settings.allowDebt) {
            if (agentA.balance <= 0) agentA.active = false;
            if (agentB.balance <= 0) agentB.active = false;
        } 
        
        agentA.peakBalance = Math.max(agentA.peakBalance, agentA.balance);
        agentB.peakBalance = Math.max(agentB.peakBalance, agentB.balance);
      }
      
      return nextAgents;
    });
    
    setRound(r => r + 1);
  }, [settings]);

  // Interval Effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(runRound, simulationSpeed);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, runRound, simulationSpeed]);


  // Derived Stats
  const activeCount = agents.filter(a => a.active).length;
  // If debt is allowed, count negatives. If not, count inactives.
  const bankruptOrDebtCount = settings.allowDebt 
    ? agents.filter(a => a.balance < 0).length 
    : agents.filter(a => !a.active).length;

  const maxBalance = Math.max(...agents.map(a => a.balance), 0);
  
  // Calculate Gini Coefficient (approximate)
  const calculateGini = () => {
    if (agents.length === 0) return 0;
    // Filter to only include active agents (or all if debt allowed) for Gini calc?
    // Usually Gini is for the whole population. If they are bankrupt (0), they contribute to inequality.
    const balances = agents.map(a => Math.max(0, a.balance)).sort((a, b) => a - b);
    const n = balances.length;
    const sum = balances.reduce((acc, val) => acc + val, 0);
    if (sum === 0) return 0;
    
    let cumulativeScore = 0;
    balances.forEach((val, i) => {
        cumulativeScore += (i + 1) * val;
    });
    
    return (2 * cumulativeScore) / (n * sum) - (n + 1) / n;
  };

  const gini = calculateGini().toFixed(3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 mb-2">
              💸 Last Wallet Standing
            </h1>
            <p className="text-slate-400 max-w-lg text-sm md:text-base leading-relaxed">
              A simulation of wealth concentration. Watch how random exchanges inevitably create extreme inequality, turning a fair start into a survival of the richest.
            </p>
          </div>
          
          <div className="flex gap-4 text-sm font-mono">
             <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 text-center">
                <div className="text-slate-500 text-xs uppercase">Round</div>
                <div className="text-xl font-bold text-white">{round}</div>
             </div>
             <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 text-center">
                <div className="text-slate-500 text-xs uppercase">Inequality (Gini)</div>
                <div className={`text-xl font-bold ${Number(gini) > 0.5 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {gini}
                </div>
             </div>
          </div>
        </header>

        {/* Main Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Controls & Stats */}
          <div className="lg:col-span-4 space-y-6">
            <ControlPanel 
                isRunning={isRunning}
                settings={settings}
                simulationSpeed={simulationSpeed}
                onTogglePlay={() => setIsRunning(!isRunning)}
                onReset={initGame}
                onSettingsChange={(s) => {
                    setSettings(prev => ({ ...prev, ...s }));
                }}
                onSpeedChange={setSimulationSpeed}
            />

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between h-24">
                     <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                        <TrendingDown className="w-4 h-4" />
                        <span>{settings.allowDebt ? 'In Debt' : 'Bankrupt'}</span>
                     </div>
                     <div className="text-3xl font-bold text-red-400">{bankruptOrDebtCount}</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between h-24">
                     <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                        <DollarSign className="w-4 h-4" />
                        <span>Top Wealth</span>
                     </div>
                     <div className="text-3xl font-bold text-emerald-400">{maxBalance}</div>
                </div>
            </div>

             {/* Top 3 Leaderboard */}
             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
                 <h3 className="text-slate-400 text-xs uppercase font-bold mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Richest Agents
                 </h3>
                 <div className="space-y-2">
                    {[...agents].sort((a,b) => b.balance - a.balance).slice(0, 3).map((a, i) => (
                        <div key={a.id} className="flex justify-between items-center text-sm border-b border-slate-800 pb-1 last:border-0">
                            <span className="text-slate-300">Agent #{a.id}</span>
                            <span className="font-mono text-amber-400">${a.balance}</span>
                        </div>
                    ))}
                 </div>
             </div>
          </div>

          {/* Right Column: Viz */}
          <div className="lg:col-span-8 space-y-6">
             
             {/* Histogram */}
             <StatsChart agents={agents} allowDebt={settings.allowDebt} />

             {/* Grid */}
             <div className="space-y-2">
                <div className="flex justify-between items-end px-2">
                    <h3 className="text-slate-400 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" /> Agent Status
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Active
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div> Rich
                        {settings.allowDebt ? (
                             <><div className="w-2 h-2 bg-red-900 rounded-full"></div> Debt</>
                        ) : (
                             <><div className="w-2 h-2 bg-slate-800 rounded-full"></div> Out</>
                        )}
                    </div>
                </div>
                <AgentGrid agents={agents} maxBalance={maxBalance} />
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;