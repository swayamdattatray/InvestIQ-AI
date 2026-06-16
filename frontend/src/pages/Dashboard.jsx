import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, BarChart2, IndianRupee, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import MarketIndices from '../components/dashboard/MarketIndices';
import { TableRowSkeleton } from '../components/common/Skeleton';
import { formatCurrencyINR } from '../utils/formatters';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading] = useState(false);

  const trendingStocks = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2985.45, change: '+1.25%', up: true },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', price: 3845.10, change: '-0.45%', up: false },
    { symbol: 'INFY.NS', name: 'Infosys Limited', price: 1542.35, change: '+2.12%', up: true },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', price: 1654.80, change: '+0.85%', up: true },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Limited', price: 1124.60, change: '+1.42%', up: true },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Market Indices */}
      <MarketIndices />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Market Dashboard</h1>
        <p className="text-gray-500 mt-1">Real-time market insights and AI analysis for Indian Markets.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Market Cap" value="₹284.4T" change="+0.4%" icon={IndianRupee} color="brand-primary" />
        <StatCard title="Active Signals" value="124" icon={Activity} color="brand-secondary" />
        <StatCard title="AI Confidence" value="84%" change="+2.1%" icon={TrendingUp} color="brand-primary" />
        <StatCard title="Volatility Index" value="14.2" change="-1.4%" icon={BarChart2} color="brand-secondary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trending Stocks */}
        <div className="lg:col-span-2 glass-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Trending Stocks</h2>
            <button className="text-brand-primary text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm uppercase tracking-wider border-b border-white/5">
                  <th className="pb-4 font-medium">Asset</th>
                  <th className="pb-4 font-medium">Price</th>
                  <th className="pb-4 font-medium">Change</th>
                  <th className="pb-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : (
                  trendingStocks.map((stock) => (
                    <tr key={stock.symbol} className="group hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate(`/stock/${stock.symbol}`)}>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-brand-primary">
                            {stock.symbol[0]}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{stock.symbol}</div>
                            <div className="text-[10px] text-gray-500">{stock.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-mono font-medium text-sm">{formatCurrencyINR(stock.price)}</td>
                      <td className="py-4">
                        <div className={`flex items-center gap-1 text-sm ${stock.up ? 'text-green-500' : 'text-red-500'}`}>
                          {stock.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {stock.change}
                        </div>
                      </td>
                      <td className="py-4">
                        <button className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded bg-white/5 hover:bg-brand-primary hover:text-dark transition-colors">
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Sector Insights */}
        <div className="glass-card flex flex-col gap-6">
          <h2 className="text-xl font-bold">AI Sector Outlook</h2>
          <div className="space-y-6">
            {[
              { sector: 'Technology', outlook: 'Bullish', score: 88 },
              { sector: 'Energy', outlook: 'Neutral', score: 52 },
              { sector: 'Banking', outlook: 'Bullish', score: 74 },
              { sector: 'Auto', outlook: 'Bearish', score: 38 },
            ].map((item) => (
              <div key={item.sector} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.sector}</span>
                  <span className={item.outlook === 'Bullish' ? 'text-green-500' : item.outlook === 'Bearish' ? 'text-red-500' : 'text-gray-400'}>
                    {item.outlook}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      item.outlook === 'Bullish' ? 'bg-green-500' : item.outlook === 'Bearish' ? 'bg-red-500' : 'bg-gray-400'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="btn-outline w-full py-2 mt-2">Generate Full Report</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
