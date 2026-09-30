import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Activity, BarChart2, IndianRupee, ArrowUpRight, ArrowDownRight,
  ShoppingCart, DollarSign, X, Check, AlertCircle
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import MarketIndices from '../components/dashboard/MarketIndices';
import { TableRowSkeleton } from '../components/common/Skeleton';
import { formatCurrencyINR } from '../utils/formatters';
import { stockService } from '../services/stockService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [tradeModal, setTradeModal] = useState(null); // { stock, action: 'BUY' | 'SELL' }
  const [tradeQty, setTradeQty] = useState('');
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [tradeSuccess, setTradeSuccess] = useState('');

  const trendingStocks = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2985.45, change: '+1.25%', up: true, currency: 'INR' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', price: 3845.10, change: '-0.45%', up: false, currency: 'INR' },
    { symbol: 'INFY.NS', name: 'Infosys Limited', price: 1542.35, change: '+2.12%', up: true, currency: 'INR' },
    { symbol: 'IBM', name: 'International Business Machines', price: 220.50, change: '+0.85%', up: true, currency: 'USD' },
    { symbol: 'AAPL', name: 'Apple Inc.', price: 234.80, change: '+1.42%', up: true, currency: 'USD' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 128.90, change: '+3.15%', up: true, currency: 'USD' },
  ];

  const handleOpenTrade = (e, stock) => {
    e.stopPropagation();
    setTradeModal({ stock, action: 'BUY' });
    setTradeQty('');
    setTradeError('');
    setTradeSuccess('');
  };

  const handleExecuteTrade = async () => {
    if (!tradeQty || parseInt(tradeQty) <= 0) {
      setTradeError('Enter a valid quantity');
      return;
    }
    setTradeLoading(true);
    setTradeError('');
    setTradeSuccess('');
    try {
      const res = await stockService.executeTrade(
        tradeModal.stock.symbol,
        tradeModal.action,
        parseInt(tradeQty)
      );
      setTradeSuccess(res.data.message);
      setTradeQty('');
      setTimeout(() => {
        setTradeModal(null);
        setTradeSuccess('');
      }, 1500);
    } catch (err) {
      setTradeError(err.response?.data?.detail || 'Trade execution failed');
    } finally {
      setTradeLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Market Indices */}
      <MarketIndices />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Market Dashboard</h1>
        <p className="text-gray-500 mt-1">Real-time market insights and AI analysis for Indian and Global Markets.</p>
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
            <span className="text-gray-500 text-xs">Click row for analysis or Trade button to paper trade</span>
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
                    <tr
                      key={stock.symbol}
                      className="group hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => navigate(`/stock/${stock.symbol}`)}
                    >
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
                      <td className="py-4 font-mono font-medium text-sm">
                        {stock.currency === 'USD' ? `$${stock.price.toFixed(2)}` : formatCurrencyINR(stock.price)}
                      </td>
                      <td className="py-4">
                        <div className={`flex items-center gap-1 text-sm ${stock.up ? 'text-green-500' : 'text-red-500'}`}>
                          {stock.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {stock.change}
                        </div>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={(e) => handleOpenTrade(e, stock)}
                          className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-dark transition-all flex items-center gap-1 shadow-sm"
                        >
                          <ShoppingCart size={12} /> Trade
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
          <button onClick={() => navigate('/learn')} className="btn-outline w-full py-2 mt-2">
            Open AI Learning Center
          </button>
        </div>
      </div>

      {/* Trade Modal directly on Dashboard */}
      <AnimatePresence>
        {tradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => { setTradeModal(null); setTradeError(''); setTradeSuccess(''); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {tradeModal.action === 'BUY' ? (
                      <><ShoppingCart className="text-green-500" size={20} /> Paper Buy {tradeModal.stock.symbol}</>
                    ) : (
                      <><DollarSign className="text-red-500" size={20} /> Paper Sell {tradeModal.stock.symbol}</>
                    )}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{tradeModal.stock.name}</p>
                </div>
                <button
                  onClick={() => { setTradeModal(null); setTradeError(''); setTradeSuccess(''); }}
                  className="p-1 text-gray-500 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Action Tabs */}
              <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-white/5 rounded-xl">
                <button
                  onClick={() => setTradeModal({ ...tradeModal, action: 'BUY' })}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    tradeModal.action === 'BUY' ? 'bg-green-500 text-dark shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setTradeModal({ ...tradeModal, action: 'SELL' })}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    tradeModal.action === 'SELL' ? 'bg-red-500 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* Price Display */}
              <div className="mb-4 p-3 rounded-xl bg-white/5 flex justify-between items-center">
                <span className="text-xs text-gray-400">Current Price</span>
                <span className="text-lg font-bold font-mono">
                  {tradeModal.stock.currency === 'USD' ? `$${tradeModal.stock.price.toFixed(2)}` : formatCurrencyINR(tradeModal.stock.price)}
                </span>
              </div>

              {/* Quantity Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Number of Shares</label>
                  <input
                    type="number"
                    value={tradeQty}
                    onChange={(e) => setTradeQty(e.target.value)}
                    placeholder="Enter quantity (e.g. 5)"
                    min="1"
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-primary/50 transition-all text-sm font-mono"
                  />
                  {tradeQty > 0 && (
                    <p className="text-xs text-gray-400 mt-2 flex justify-between">
                      <span>Total Estimated Cost:</span>
                      <span className="font-mono font-bold text-white">
                        {tradeModal.stock.currency === 'USD'
                          ? `$${(tradeModal.stock.price * parseInt(tradeQty || 0)).toFixed(2)}`
                          : formatCurrencyINR(tradeModal.stock.price * parseInt(tradeQty || 0))}
                      </span>
                    </p>
                  )}
                </div>

                {tradeError && (
                  <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-xl">
                    <AlertCircle size={16} className="flex-shrink-0" /> {tradeError}
                  </div>
                )}
                {tradeSuccess && (
                  <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 p-3 rounded-xl">
                    <Check size={16} className="flex-shrink-0" /> {tradeSuccess}
                  </div>
                )}

                <button
                  onClick={handleExecuteTrade}
                  disabled={tradeLoading}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    tradeModal.action === 'BUY'
                      ? 'bg-green-500 hover:bg-green-600 text-dark'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  } ${tradeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {tradeLoading ? 'Placing Order...' : `${tradeModal.action} ${tradeQty || 0} Shares`}
                </button>

                <button
                  onClick={() => {
                    const sym = tradeModal.stock.symbol;
                    setTradeModal(null);
                    navigate(`/stock/${sym}`);
                  }}
                  className="w-full py-2 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  View Full Stock Analysis & Charts →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
