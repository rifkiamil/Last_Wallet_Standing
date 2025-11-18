import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Agent } from '../types';

interface StatsChartProps {
  agents: Agent[];
  allowDebt: boolean;
}

export const StatsChart: React.FC<StatsChartProps> = ({ agents, allowDebt }) => {
  const data = useMemo(() => {
    // Create buckets for wealth distribution
    // Determine range
    const balances = agents.filter(a => a.active || allowDebt).map(a => a.balance);
    if (balances.length === 0) return [];

    const min = Math.min(...balances);
    const max = Math.max(...balances);
    
    // Create roughly 10-15 buckets
    const bucketSize = Math.max(5, Math.ceil((max - min) / 15));
    
    const distribution = new Map<string, number>();
    const bucketKeys: { name: string, minVal: number, count: number }[] = [];

    // Initialize buckets to ensure order
    const startBucket = Math.floor(min / bucketSize) * bucketSize;
    const endBucket = Math.ceil(max / bucketSize) * bucketSize;

    for (let i = startBucket; i <= endBucket; i += bucketSize) {
      const label = `${i}-${i + bucketSize - 1}`;
      bucketKeys.push({ name: label, minVal: i, count: 0 });
    }

    balances.forEach(b => {
      const bucketIndex = bucketKeys.findIndex(k => b >= k.minVal && b < k.minVal + bucketSize);
      if (bucketIndex !== -1) {
        bucketKeys[bucketIndex].count++;
      }
    });

    // Filter out empty tail buckets if too many, but keep the shape
    return bucketKeys.filter(b => b.count > 0 || (b.minVal >= min && b.minVal <= max));
  }, [agents, allowDebt]);

  return (
    <div className="h-64 w-full bg-slate-900 rounded-xl border border-slate-800 p-2 shadow-inner">
      <h3 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2 ml-2">Wealth Distribution (Histogram)</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} barCategoryGap={1}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            tick={{ fontSize: 10 }} 
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} allowDecimals={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
            itemStyle={{ color: '#f1f5f9' }}
            cursor={{ fill: '#334155', opacity: 0.2 }}
          />
          <Bar dataKey="count" animationDuration={300}>
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.minVal < 0 ? '#ef4444' : '#10b981'} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};