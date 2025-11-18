import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Label
} from 'recharts';
import { Agent } from '../types';

interface StatsChartProps {
  agents: Agent[];
  allowDebt: boolean;
}

export const StatsChart: React.FC<StatsChartProps> = ({ agents, allowDebt }) => {
  const [data, setData] = useState<{ name: string, minVal: number, count: number }[]>([]);
  const lastUpdateRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Data processing function
  const processData = (currentAgents: Agent[], isDebtAllowed: boolean) => {
    const balances = currentAgents.filter(a => a.active || isDebtAllowed).map(a => a.balance);
    if (balances.length === 0) return [];

    const min = Math.min(...balances);
    const max = Math.max(...balances);
    
    // Dynamic bucket sizing
    const range = max - min;
    const bucketCount = 15;
    // Determine raw size
    const rawBucketSize = Math.max(5, range / bucketCount);
    
    // Round bucket size to nice number (5, 10, 20, 50, 100...)
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawBucketSize)));
    let bucketSize = magnitude;
    if (rawBucketSize / magnitude >= 2) bucketSize = magnitude * 2;
    if (rawBucketSize / magnitude >= 5) bucketSize = magnitude * 5;
    
    const bucketKeys: { name: string, minVal: number, count: number }[] = [];

    // Align start to bucket size
    const startBucket = Math.floor(min / bucketSize) * bucketSize;
    // Ensure we cover the max
    const endBucket = Math.ceil((max + 1) / bucketSize) * bucketSize; 

    for (let i = startBucket; i < endBucket; i += bucketSize) {
      const label = `${i}`;
      bucketKeys.push({ name: label, minVal: i, count: 0 });
    }

    balances.forEach(b => {
      const bucketIndex = bucketKeys.findIndex(k => b >= k.minVal && b < k.minVal + bucketSize);
      if (bucketIndex !== -1) {
        bucketKeys[bucketIndex].count++;
      } else if (bucketKeys.length > 0 && b >= bucketKeys[bucketKeys.length-1].minVal) {
         bucketKeys[bucketKeys.length-1].count++;
      }
    });

    return bucketKeys;
  };

  useEffect(() => {
    const now = Date.now();
    // Throttle updates to every 500ms
    if (now - lastUpdateRef.current > 500) {
        setData(processData(agents, allowDebt));
        lastUpdateRef.current = now;
    } else {
        // Schedule trailing update to ensure final state is shown when simulation pauses
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setData(processData(agents, allowDebt));
            lastUpdateRef.current = Date.now();
        }, 500);
    }

    return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [agents, allowDebt]);

  return (
    <div className="h-80 w-full bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-inner flex flex-col">
      <h3 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2 ml-2">Wealth Distribution</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              tick={{ fontSize: 10 }} 
              interval="preserveStartEnd"
              minTickGap={30}
            >
               <Label value="Wallet Balance ($)" offset={0} position="insideBottom" fill="#64748b" style={{ fontSize: '12px' }} dy={15} />
            </XAxis>
            <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} allowDecimals={false}>
               <Label value="Agent Count" angle={-90} position="insideLeft" fill="#64748b" style={{ fontSize: '12px', textAnchor: 'middle' }} dx={-10} />
            </YAxis>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
              itemStyle={{ color: '#f1f5f9' }}
              cursor={{ fill: '#334155', opacity: 0.2 }}
              formatter={(value: number) => [value, 'Agents']}
              labelFormatter={(label) => `Balance: >= ${label}`}
            />
            <Bar dataKey="count" isAnimationActive={false}>
               {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.minVal < 0 ? '#ef4444' : '#10b981'} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};