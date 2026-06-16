import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Search, Plus } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { formatCurrencyINR } from '../utils/formatters';

const Portfolio = () => {
  const watchlist = [
    { symbol: 'RELIANCE.NS', price: 2985.45, change: '+1.2%', up: true },
    { symbol: 'TCS.NS', price: 3845.10, change: '-0.5%', up: false },
    { symbol: 'INFY.NS', price: 1542.35, change: '+0.8%', up: true },
    { symbol: 'HDFCBANK.NS', price: 1654.80, change: '+2.4%', up: true },
  ];

  const holdings = [
    { symbol: 'RELIANCE.NS', qty: 10, avgPrice: 2500.00, currentPrice: 2985.45, pnl: 4854.50, pnlPercent: '+19.4%', up: true },
    { symbol: 'TCS.NS', qty: 5, avgPrice: 3500.00, currentPrice: 3845.10, pnl: 1725.50, pnlPercent: '+9.8%', up: true },
    { symbol: 'ZOMATO.NS', qty: 500, avgPrice: 120.00, currentPrice: 185.30, pnl: 32650.00, pnlPercent: '+54.4%', up: true },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Your Portfolio</h1>
          <p className="text-gray-500 mt-1">Manage your Indian equity assets and track performance.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline py-2 px-4 text-sm flex items-center gap-2">
            <Plus size={18} /> Add Asset
          </button>
          <button className="btn-primary py-2 px-4 text-sm">
            Invest More
          </button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass-card bg-gradient-to-br from-brand-primary/10 via-transparent to-transparent">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Total Net Worth</p>
              <h2 className="text-4xl font-black font-mono">{formatCurrencyINR(152450.68)}</h2>
              <div className="flex items-center gap-2 text-green-500 text-sm mt-3 font-bold">
                <div className="p-1 rounded bg-green-500/10"><TrendingUp size={14} /></div>
                +₹39,230.20 (34.6%) All Time
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <Wallet className="text-brand-primary" size={32} />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/5">
            <div>
              <p className="text-gray-500 text-[10px] font-medium uppercase mb-1">Invested</p>
              <p className="text-md font-bold font-mono">{formatCurrencyINR(113220.48)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-medium uppercase mb-1">Cash</p>
              <p className="text-md font-bold font-mono">{formatCurrencyINR(39230.20)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-medium uppercase mb-1">Day's P&L</p>
              <p className="text-md font-bold font-mono text-red-500">-₹1,442.10</p>
            </div>
          </div>
        </div>

        <div className="glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2 text-sm"><PieChart size={16} className="text-brand-secondary" /> Allocation</h3>
          </div>
          <div className="flex-grow flex items-center justify-center relative py-4">
             {/* Mock Donut Chart */}
             <div className="w-28 h-28 rounded-full border-[10px] border-brand-primary border-t-brand-secondary border-r-brand-secondary/50 border-l-brand-primary/50 relative">
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Equity</span>
                  <span className="text-md font-bold">82%</span>
                </div>
             </div>
          </div>
          <div className="space-y-2 mt-6">
            <div className="flex justify-between text-[10px]">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-primary" /> Energy</span>
              <span className="font-bold">44%</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-secondary" /> IT</span>
              <span className="font-bold">38%</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-600" /> Others</span>
              <span className="font-bold">18%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Holdings Table */}
        <div className="lg:col-span-2 glass-card">
          <h2 className="text-xl font-bold mb-6">Current Holdings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm uppercase tracking-wider border-b border-white/5">
                  <th className="pb-4 font-medium">Asset</th>
                  <th className="pb-4 font-medium">Qty</th>
                  <th className="pb-4 font-medium">Avg. Cost</th>
                  <th className="pb-4 font-medium">Current</th>
                  <th className="pb-4 font-medium text-right">Returns</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {holdings.map((h) => (
                  <tr key={h.symbol} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="py-4">
                      <div className="font-bold text-sm">{h.symbol}</div>
                      <div className="text-[10px] text-gray-500 uppercase">Equity</div>
                    </td>
                    <td className="py-4 font-mono text-sm">{h.qty}</td>
                    <td className="py-4 font-mono text-[10px] text-gray-400">{formatCurrencyINR(h.avgPrice)}</td>
                    <td className="py-4 font-mono text-sm">{formatCurrencyINR(h.currentPrice)}</td>
                    <td className="py-4 text-right">
                      <div className={`font-bold text-sm ${h.up ? 'text-green-500' : 'text-red-500'}`}>+₹{h.pnl}</div>
                      <div className={`text-[10px] ${h.up ? 'text-green-500' : 'text-red-500'}`}>{h.pnlPercent}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Watchlist Sidebar */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Watchlist</h2>
            <button className="text-brand-primary text-sm font-medium hover:underline">Manage</button>
          </div>
          <div className="flex flex-col gap-4">
            {watchlist.map((item) => (
              <motion.div 
                whileHover={{ x: 4 }}
                key={item.symbol} 
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
              >
                <div>
                  <div className="font-bold text-sm">{item.symbol}</div>
                  <div className="text-[10px] text-gray-500 font-mono">{formatCurrencyINR(item.price)}</div>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${item.up ? 'text-green-500' : 'text-red-500'}`}>
                  {item.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {item.change}
                </div>
              </motion.div>
            ))}
            <button className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-gray-500 hover:text-white hover:border-white/20 transition-all text-xs font-medium mt-2 flex items-center justify-center gap-2">
              <Plus size={16} /> Add to Watchlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
