import React from 'react';
import { Play, Pause, RotateCcw, Settings2, Info } from 'lucide-react';
import { SimulationSettings } from '../types';

interface ControlPanelProps {
  isRunning: boolean;
  settings: SimulationSettings;
  simulationSpeed: number; // Delay in ms
  onTogglePlay: () => void;
  onReset: () => void;
  onSettingsChange: (newSettings: Partial<SimulationSettings>) => void;
  onSpeedChange: (newSpeed: number) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  settings,
  simulationSpeed,
  onTogglePlay,
  onReset,
  onSettingsChange,
  onSpeedChange
}) => {
  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg flex flex-col gap-6">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between">
         <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-400" />
            Controls
         </h2>
         <div className="flex gap-2">
            <button
              onClick={onTogglePlay}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all
                ${isRunning 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/50 hover:bg-amber-500/20' 
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}
              `}
            >
              {isRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Run</>}
            </button>
            <button
              onClick={onReset}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-700 transition-all"
              title="Reset Simulation"
            >
              <RotateCcw size={18} />
            </button>
         </div>
      </div>

      {/* Sliders & Toggles */}
      <div className="space-y-5">
        
        {/* Speed Control */}
        <div className="space-y-2">
            <div className="flex justify-between text-xs uppercase tracking-wider text-slate-400 font-semibold">
                <span>Speed</span>
                <span>{simulationSpeed < 50 ? 'Turbo' : simulationSpeed > 500 ? 'Slow' : 'Normal'}</span>
            </div>
            <input
                type="range"
                min="10"
                max="1000"
                step="10"
                // Reverse logic: slider right (high value) should be fast (low delay)
                // But HTML range is min->max. Let's handle mapping in the parent or visually here.
                // Let's make Left = Slow (1000ms), Right = Fast (10ms)
                value={1010 - simulationSpeed} 
                onChange={(e) => onSpeedChange(1010 - parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
        </div>

        {/* Transactions Per Round */}
        <div className="space-y-2">
             <div className="flex justify-between text-xs uppercase tracking-wider text-slate-400 font-semibold">
                <span>Tx / Round</span>
                <span className="text-indigo-300">{settings.transactionsPerRound}</span>
            </div>
            <input
                type="range"
                min="1"
                max="500"
                step="10"
                value={settings.transactionsPerRound}
                onChange={(e) => onSettingsChange({ transactionsPerRound: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
        </div>

        {/* Debt Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-200">Allow Debt</span>
                <span className="text-xs text-slate-500">Balance can go negative</span>
            </div>
            <button
                onClick={() => onSettingsChange({ allowDebt: !settings.allowDebt })}
                className={`
                    w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative
                    ${settings.allowDebt ? 'bg-indigo-500' : 'bg-slate-600'}
                `}
            >
                <span className={`
                    absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200
                    ${settings.allowDebt ? 'translate-x-5' : 'translate-x-0'}
                `} />
            </button>
        </div>
      </div>

      <div className="bg-indigo-950/30 p-3 rounded-lg border border-indigo-500/20 text-xs text-indigo-200/80 flex items-start gap-2">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
            Statistical Mechanics of Money: Even with fair, random exchanges, wealth naturally concentrates. 
            This leads to a Boltzmann-Gibbs distribution, showing how inequality is a mathematical inevitability in random systems.
        </p>
      </div>

    </div>
  );
};