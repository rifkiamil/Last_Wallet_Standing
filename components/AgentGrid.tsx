import React from 'react';
import { Skull } from 'lucide-react';
import { Agent } from '../types';

interface AgentGridProps {
  agents: Agent[];
  maxBalance: number;
}

export const AgentGrid: React.FC<AgentGridProps> = ({ agents, maxBalance }) => {
  // Helper to determine color based on wealth relative to max
  const getAgentStyles = (agent: Agent) => {
    if (!agent.active) {
      // Eliminated / Ghost mode
      return 'bg-slate-950/30 border-slate-900/50 text-slate-800 shadow-none grayscale opacity-20'; 
    }
    if (agent.balance < 0) return 'bg-red-900/50 border-red-700 text-red-200'; // In Debt
    if (agent.balance === 0) return 'bg-slate-800 border-slate-700 text-slate-500'; // Zero but active (rare/temp)
    
    // Normalize balance for color intensity (0 to 1)
    const ratio = Math.min(agent.balance / (maxBalance || 1), 1);
    
    if (ratio > 0.8) return 'bg-amber-400 border-amber-200 text-black font-bold shadow-[0_0_10px_rgba(251,191,36,0.4)] scale-105 z-10';
    if (ratio > 0.5) return 'bg-emerald-400 border-emerald-300 text-black';
    if (ratio > 0.25) return 'bg-emerald-600 border-emerald-500 text-white';
    return 'bg-emerald-900/60 border-emerald-800 text-emerald-100';
  };

  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-inner max-h-[400px] overflow-y-auto custom-scrollbar">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className={`
            relative aspect-square flex items-center justify-center rounded-md border transition-all duration-500 text-xs sm:text-sm select-none
            ${getAgentStyles(agent)}
          `}
          title={!agent.active ? `Agent ${agent.id}: Bankrupt` : `Agent ${agent.id}: $${agent.balance}`}
        >
          {!agent.active ? (
            <Skull size={16} strokeWidth={1.5} />
          ) : (
            agent.balance
          )}
        </div>
      ))}
    </div>
  );
};