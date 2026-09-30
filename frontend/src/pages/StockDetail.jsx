import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, TrendingUp, TrendingDown, AlertCircle, Share2, Plus, Activity,
  Shield, ShoppingCart, DollarSign, X, Check, Target, BarChart3
} from 'lucide-react';
import { useStockData } from '../hooks/useStockData';
import { stockService } from '../services/stockService';
import StockChart from '../components/charts/StockChart';
import { CardSkeleton } from '../components/common/Skeleton';
import { formatCurrencyINR, formatNumberIN } from '../utils/formatters';

const StockDetail = () => {
  const { symbol } = useParams();
  const { data, analysis, loading, error } = useStockData(symbol);
  const [tradeModal, setTradeModal] = useState(null);
  const [tradeQty, setTradeQty] = useState('');
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [tradeSuccess, setTradeSuccess] = useState('');

  const handleTrade = async () => {
    if (!tradeQty || parseInt(tradeQty) <= 0) {
      setTradeError('Enter a valid quantity');
      return;
    }
    setTradeLoading(true);
    setTradeError('');
    try {
      const res = await stockService.executeTrade(symbol, tradeModal.action, parseInt(tradeQty));
      setTradeSuccess(res.data.message);
      setTradeQty('');
      setTimeout(() => {
        setTradeModal(null);
        setTradeSuccess('');
      }, 2000);
    } catch (err) {
      setTradeError(err.response?.data?.detail || 'Trade failed');
    } finally {
      setTradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-white/5 animate-pulse rounded-lg" />
          <div className="space-y-2">
            <div className="h-8 w-32 bg-white/5 animate-pulse rounded" />
            <div className="h-4 w-48 bg-white/5 animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="h-[400px] w-full bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center max-w-md mx-auto">
        <div className="p-4 rounded-full bg-red-500/10 text-red-500">
          <AlertCircle size={48} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
          <p className="text-gray-500">{error}</p>
        </div>
        <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const chartData = [
    { time: '09:30', price: data.price * 0.98 },
    { time: '10:30', price: data.price * 0.99 },
    { time: '11:30', price: data.price * 0.985 },
    { time: '12:30', price: data.price * 1.01 },
    { time: '13:30', price: data.price * 1.005 },
    { time: '14:30', price: data.price * 1.02 },
    { time: '15:30', price: data.price },
  ];

  const getSignalColor = (signal) => {
    switch (signal?.toUpperCase()) {
      case 'BUY': return 'text-green-500';
      case 'SELL': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'LOW': return 'text-green-500 bg-green-500/10';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10';
      case 'VERY HIGH': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-white/5';
    }
  };

  const getRiskWidth = (level) => {
    switch (level) {
      case 'LOW': return '25%';
      case 'MEDIUM': return '50%';
      case 'HIGH': return '75%';
      case 'VERY HIGH': return '100%';
      default: return '0%';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{symbol}</h1>
              <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-bold text-gray-400">
                {data.exchange || 'STOCK'}
              </span>
            </div>
            <p className="text-gray-500 text-sm">{data.short_name || 'Stock Analysis'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setTradeModal({ action: 'BUY' })}
            className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
            <ShoppingCart size={16} /> Paper Buy
          </button>
          <button onClick={() => setTradeModal({ action: 'SELL' })}
            className="btn-outline py-2 px-4 text-sm flex items-center gap-2">
            <DollarSign size={16} /> Paper Sell
          </button>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Current Price</p>
          <h2 className="text-3xl font-bold font-mono">{formatCurrencyINR(data.price)}</h2>
          <p className="text-xs text-gray-500 mt-2">{data.currency} · {data.exchange}</p>
        </div>

        <div className="glass-card relative overflow-hidden group">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">AI Signal</p>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-4xl font-black italic tracking-tighter ${getSignalColor(analysis.signal)}`}>
              {analysis.signal}
            </h2>
            <div className={`h-3 w-3 rounded-full animate-ping ${analysis.signal === 'BUY' ? 'bg-green-500' : analysis.signal === 'SELL' ? 'bg-red-500' : 'bg-yellow-500'}`} />
          </div>
          <p className="text-xs text-gray-400 mt-2">RSI + MA Crossover</p>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className={getSignalColor(analysis.signal)} size={64} />
          </div>
        </div>

        <div className="glass-card">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">RSI (14)</p>
          <h2 className="text-4xl font-bold font-mono">{formatNumberIN(analysis.rsi)}</h2>
          <p className={`text-xs mt-2 font-medium ${analysis.rsi > 70 ? 'text-red-500' : analysis.rsi < 30 ? 'text-green-500' : 'text-gray-400'}`}>
            {analysis.rsi > 70 ? 'Overbought' : analysis.rsi < 30 ? 'Oversold' : 'Neutral'}
          </p>
        </div>

        <div className="glass-card">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Volatility</p>
          <h2 className="text-4xl font-bold font-mono">{formatNumberIN(analysis.volatility)}%</h2>
          <p className="text-xs text-gray-400 mt-2 font-medium">Annualized</p>
        </div>
      </div>

      {/* Risk Assessment Section */}
      {analysis.risk_level && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Risk Level Gauge */}
          <div className="glass-card lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-brand-secondary" />
              <h3 className="text-lg font-bold">Risk Assessment</h3>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getRiskColor(analysis.risk_level)}`}>
                {analysis.risk_level} RISK
              </span>
              <span className="text-gray-500 text-xs">Based on volatility, drawdown & beta</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden mb-4">
              <motion.div initial={{ width: 0 }}
                animate={{ width: getRiskWidth(analysis.risk_level) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className={`h-full rounded-full ${analysis.risk_level === 'LOW' ? 'bg-green-500' : analysis.risk_level === 'MEDIUM' ? 'bg-yellow-500' : analysis.risk_level === 'HIGH' ? 'bg-orange-500' : 'bg-red-500'}`} />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <p className="text-gray-500 uppercase tracking-wider mb-1">Max Drawdown</p>
                <p className="font-bold text-red-500 font-mono">{analysis.max_drawdown}%</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase tracking-wider mb-1">Sharpe Ratio</p>
                <p className={`font-bold font-mono ${analysis.sharpe_ratio >= 1 ? 'text-green-500' : analysis.sharpe_ratio >= 0 ? 'text-yellow-500' : 'text-red-500'}`}>{analysis.sharpe_ratio}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase tracking-wider mb-1">Beta</p>
                <p className="font-bold font-mono">{analysis.beta}</p>
              </div>
            </div>
          </div>

          {/* Support / Resistance */}
          <div className="glass-card">
            <div className="flex items-center gap-2 mb-4">
              <Target size={18} className="text-brand-primary" />
              <h3 className="font-bold text-sm">Support Level</h3>
            </div>
            <p className="text-2xl font-bold font-mono text-green-500">{formatCurrencyINR(analysis.support_level)}</p>
            <p className="text-xs text-gray-500 mt-2">Price floor based on recent lows</p>
          </div>

          <div className="glass-card">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-red-400" />
              <h3 className="font-bold text-sm">Resistance Level</h3>
            </div>
            <p className="text-2xl font-bold font-mono text-red-400">{formatCurrencyINR(analysis.resistance_level)}</p>
            <p className="text-xs text-gray-500 mt-2">Price ceiling based on recent highs</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card flex-grow h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold">Price Action</h3>
              <div className="flex gap-2">
                {['1D', '1W', '1M', '1Y', 'ALL'].map(t => (
                  <button key={t} className={`px-3 py-1 rounded text-xs font-bold ${t === '1D' ? 'bg-brand-primary text-dark' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <StockChart data={chartData} color={analysis.signal === 'BUY' ? '#00d09c' : analysis.signal === 'SELL' ? '#ff5252' : '#5367ff'} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="glass-card flex items-center justify-between p-4">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase mb-1">MA 50</p>
                <p className="font-bold font-mono">{formatCurrencyINR(analysis.ma50)}</p>
              </div>
              <div className={`p-2 rounded-full ${data.price > analysis.ma50 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {data.price > analysis.ma50 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
            </div>
            <div className="glass-card flex items-center justify-between p-4">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase mb-1">MA 200</p>
                <p className="font-bold font-mono">{formatCurrencyINR(analysis.ma200)}</p>
              </div>
              <div className={`p-2 rounded-full ${data.price > analysis.ma200 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {data.price > analysis.ma200 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="glass-card bg-gradient-to-br from-brand-secondary/10 to-transparent border-brand-secondary/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded bg-brand-secondary text-white">
                <TrendingUp size={18} />
              </div>
              <h3 className="text-lg font-bold">AI Insights</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
              "The current technical indicators for {symbol} suggest a {analysis.signal.toLowerCase()} sentiment.
              The RSI at {formatNumberIN(analysis.rsi, 1)} indicates {analysis.rsi > 60 ? 'strengthening bullish momentum' : analysis.rsi < 40 ? 'increasing bearish pressure' : 'a stable market consolidation'}.
              Prices are currently trading {data.price > analysis.ma50 ? 'above' : 'below'} the 50-day moving average,
              confirming a {data.price > analysis.ma50 ? 'bullish' : 'bearish'} trend in the medium term.
              {analysis.risk_level && ` The risk level is assessed as ${analysis.risk_level.toLowerCase()} with a max drawdown of ${analysis.max_drawdown}%.`}"
            </p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-500">SIGNAL CONFIDENCE</span>
                <span className="text-brand-primary">
                  {analysis.rsi < 30 || analysis.rsi > 70 ? '92%' : analysis.rsi < 40 || analysis.rsi > 60 ? '74%' : '56%'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: analysis.rsi < 30 || analysis.rsi > 70 ? '92%' : analysis.rsi < 40 || analysis.rsi > 60 ? '74%' : '56%' }}
                  className="h-full bg-brand-primary rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="flex items-center gap-2 mb-4 text-yellow-500">
              <AlertCircle size={20} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Market Risk</h3>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Investments in the securities market are subject to market risks. Read all the related documents carefully before investing.
              This is a paper trading simulation. No real money is involved. Always use stop-loss orders when trading with real capital.
            </p>
          </div>
        </div>
      </div>

      {/* Trade Modal */}
      <AnimatePresence>
        {tradeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { setTradeModal(null); setTradeError(''); setTradeSuccess(''); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-dark-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {tradeModal.action === 'BUY' ?
                    <><ShoppingCart className="text-green-500" size={20} /> Paper Buy {symbol}</> :
                    <><DollarSign className="text-red-500" size={20} /> Paper Sell {symbol}</>
                  }
                </h3>
                <button onClick={() => { setTradeModal(null); setTradeError(''); setTradeSuccess(''); }}
                  className="p-1 text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="mb-4 p-3 rounded-xl bg-white/5">
                <p className="text-xs text-gray-500">Current Price</p>
                <p className="text-xl font-bold font-mono">{formatCurrencyINR(data.price)}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Quantity</label>
                  <input type="number" value={tradeQty} onChange={e => setTradeQty(e.target.value)}
                    placeholder="Number of shares" min="1" autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-primary/50 transition-all text-sm" />
                  {tradeQty > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Total: <span className="font-mono font-bold text-white">{formatCurrencyINR(data.price * parseInt(tradeQty || 0))}</span>
                    </p>
                  )}
                </div>
                {tradeError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-xl">
                    <AlertCircle size={16} /> {tradeError}
                  </div>
                )}
                {tradeSuccess && (
                  <div className="flex items-center gap-2 text-green-500 text-sm bg-green-500/10 p-3 rounded-xl">
                    <Check size={16} /> {tradeSuccess}
                  </div>
                )}
                <button onClick={handleTrade} disabled={tradeLoading}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${tradeModal.action === 'BUY' ? 'bg-green-500 hover:bg-green-600 text-dark' : 'bg-red-500 hover:bg-red-600 text-white'} ${tradeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {tradeLoading ? 'Processing...' : `${tradeModal.action} ${tradeQty || 0} Shares`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockDetail;
