import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const StockChart = ({ data, color = "#00d09c" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500">
        No chart data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis 
          dataKey="time" 
          stroke="#666" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          tick={{ fill: '#666' }}
        />
        <YAxis 
          stroke="#666" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          domain={['auto', 'auto']}
          tick={{ fill: '#666' }}
          tickFormatter={(val) => `$${val}`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
          itemStyle={{ color: color }}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorPrice)"
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default StockChart;
