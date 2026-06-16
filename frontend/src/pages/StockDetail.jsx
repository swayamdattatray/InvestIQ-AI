import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, TrendingUp, TrendingDown, AlertCircle, Share2, Plus, Activity } from 'lucide-react';
import { useStockData } from '../hooks/useStockData';
import StockChart from '../components/charts/StockChart';
import { CardSkeleton } from '../components/common/Skeleton';
import { formatCurrencyINR, formatNumberIN } from '../utils/formatters';

const StockDetail = () => {
  const { symbol } = useParams();
  const { data, analysis, loading, error } = useStockData(symbol);

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
              <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-bold text-gray-400">NSE</span>
            </div>
            <p className="text-gray-500 text-sm">{data.company_name || 'Stock Analysis'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400">
            <Share2 size={20} />
          </button>
          <button className="btn-outline flex items-center gap-2 py-2 px-4 text-sm">
            <Plus size={18} /> Add to Watchlist
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Current Price</p>
          <h2 className="text-3xl font-bold font-mono">{formatCurrencyINR(data.price)}</h2>
          <div className="flex items-center gap-1 text-green-500 text-sm mt-2 font-medium">
            <TrendingUp size={16} /> ₹24.50 (0.85%)
          </div>
        </div>

        <div className="glass-card relative overflow-hidden group">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">AI Intelligence</p>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-4xl font-black italic tracking-tighter ${getSignalColor(analysis.signal)}`}>
              {analysis.signal}
            </h2>
            <div className={`h-3 w-3 rounded-full animate-ping ${analysis.signal === 'BUY' ? 'bg-green-500' : analysis.signal === 'SELL' ? 'bg-red-500' : 'bg-yellow-500'}`} />
          </div>
          <p className="text-xs text-gray-400 mt-2">Strength: <span className="text-white font-bold">Strong</span></p>
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
          <p className="text-xs text-gray-400 mt-2 font-medium">Daily Range</p>
        </div>
      </div>

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
                <p className="font-bold font-mono">{formatCurrencyINR(analysis.ma_50)}</p>
              </div>
              <div className={`p-2 rounded-full ${data.price > analysis.ma_50 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {data.price > analysis.ma_50 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
            </div>
            <div className="glass-card flex items-center justify-between p-4">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase mb-1">MA 200</p>
                <p className="font-bold font-mono">{formatCurrencyINR(analysis.ma_200)}</p>
              </div>
              <div className={`p-2 rounded-full ${data.price > analysis.ma_200 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {data.price > analysis.ma_200 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
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
              "The current technical indicators for {symbol} suggest a {analysis.signal.toLowerCase()} sentiment in the Indian market. 
              The RSI at {formatNumberIN(analysis.rsi, 1)} indicates {analysis.rsi > 60 ? 'strengthening bullish momentum' : analysis.rsi < 40 ? 'increasing bearish pressure' : 'a stable market consolidation'}. 
              Prices are currently trading {data.price > analysis.ma_50 ? 'above' : 'below'} the 50-day moving average, 
              confirming a {data.price > analysis.ma_50 ? 'bullish' : 'bearish'} trend in the medium term."
            </p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-500">BULLISH CONFIDENCE</span>
                <span className="text-brand-primary">82%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '82%' }}
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
              High volatility detected. Always use stop-loss orders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
