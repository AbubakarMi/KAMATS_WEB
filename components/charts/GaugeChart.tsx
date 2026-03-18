'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  color?: string;
  size?: number;
}

export function GaugeChart({
  value,
  max,
  label,
  color = '#1565C0',
  size = 160,
}: GaugeChartProps) {
  const pct = Math.min((value / max) * 100, 100);
  const data = [{ name: 'value', value: pct, fill: color }];

  return (
    <div className="text-center">
      <ResponsiveContainer width={size} height={size}>
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={180}
          endAngle={0}
          barSize={12}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            background={{ fill: '#f0f0f0' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="-mt-7">
        <span className="text-xl font-bold text-slate-900">
          {value.toLocaleString()}
        </span>
        <br />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
    </div>
  );
}
