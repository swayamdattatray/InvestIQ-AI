import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FlaskConical, Play, TrendingUp, TrendingDown, BarChart3,
  Target, Shield, Trophy, AlertTriangle, Activity
} from 'lucide-react';
import { stockService } from '../services/stockService';
import { formatCurrencyINR, formatNumberIN } from '../utils/formatters';

const Backtest = () => {
  const [symbol, setSymbol] = useState('');
  const [params, setParams] = useState({
    initial_capital: 1000000,
    rsi_buy_threshold: 30,
    rsi_sell_threshold: 70,
    ma_short_period: 50,
    ma_long_period: 200,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runBacktest = async () => {
    if (!symbol.trim()) {
      setError('Enter a stock symbol');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await stockService.runBacktest(symbol.trim().toUpperCase(), params);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Backtest failed. The symbol may not have enough historical data.');
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ icon: Icon, label, value, sub, color = 'text-white' }) => (
    <div className="glass-card flex flex-col gap-2">
      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider">
        <Icon size={14} /> {label}
      </div>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FlaskConical className="text-brand-secondary" /> Strategy Backtester
        </h1>
        <p className="text-gray-500 mt-1">
          Test how RSI + Moving Average crossover signals would have performed on historical data.
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="glass-card">
        <h2 className="text-lg font-bold mb-6">Configure Strategy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Stock Symbol</label>
            <input type="text" value={symbol} onChange={e => setSymbol(e.target.value)}
              placeholder="e.g. AAPL, IBM, MSFT"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-secondary/50 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Initial Capital (₹)</label>
            <input type="number" value={params.initial_capital}
              onChange={e => setParams({ ...params, initial_capital: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-secondary/50 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">RSI Buy Threshold</label>
            <input type="number" value={params.rsi_buy_threshold} min="0" max="100"
              onChange={e => setParams({ ...params, rsi_buy_threshold: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-secondary/50 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">RSI Sell Threshold</label>
            <input type="number" value={params.rsi_sell_threshold} min="0" max="100"
              onChange={e => setParams({ ...params, rsi_sell_threshold: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-secondary/50 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Short MA Period</label>
            <input type="number" value={params.ma_short_period} min="1"
              onChange={e => setParams({ ...params, ma_short_period: parseInt(e.target.value) || 1 })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-secondary/50 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Long MA Period</label>
            <input type="number" value={params.ma_long_period} min="1"
              onChange={e => setParams({ ...params, ma_long_period: parseInt(e.target.value) || 1 })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-secondary/50 transition-all text-sm" />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-xl mt-6">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <button onClick={runBacktest} disabled={loading}
          className={`btn-primary py-3 px-8 text-sm mt-6 flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {loading ? (
            <><Activity size={16} className="animate-spin" /> Running Backtest...</>
          ) : (
            <><Play size={16} /> Run Backtest</>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-8">

          {/* Summary Banner */}
          <div className={`glass-card bg-gradient-to-br ${result.total_return_pct >= 0 ? 'from-green-500/10' : 'from-red-500/10'} to-transparent`}>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Backtest Result: {result.symbol}</p>
                <h2 className="text-3xl font-bold font-mono flex items-center gap-2">
                  {formatCurrencyINR(result.initial_capital)} → {formatCurrencyINR(result.final_value)}
                </h2>
                <p className="text-sm text-gray-400 mt-1">Strategy: {result.strategy}</p>
              </div>
              <div className={`text-4xl font-black font-mono ${result.total_return_pct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {result.total_return_pct >= 0 ? '+' : ''}{result.total_return_pct}%
              </div>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard icon={Target} label="Total Trades" value={result.total_trades} />
            <MetricCard icon={Trophy} label="Win Rate"
              value={`${result.win_rate_pct}%`}
              color={result.win_rate_pct >= 50 ? 'text-green-500' : 'text-red-500'} />
            <MetricCard icon={TrendingDown} label="Max Drawdown"
              value={`${result.max_drawdown_pct}%`}
              color="text-red-500" />
            <MetricCard icon={BarChart3} label="Sharpe Ratio"
              value={result.sharpe_ratio}
              color={result.sharpe_ratio >= 1 ? 'text-green-500' : result.sharpe_ratio >= 0 ? 'text-yellow-500' : 'text-red-500'} />
            <MetricCard icon={TrendingUp} label="Best Trade"
              value={`${result.best_trade_pct >= 0 ? '+' : ''}${result.best_trade_pct}%`}
              color="text-green-500" />
            <MetricCard icon={Shield} label="Worst Trade"
              value={`${result.worst_trade_pct}%`}
              color="text-red-500" />
          </div>

          {/* Win/Loss Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card">
              <h3 className="text-lg font-bold mb-4">Win/Loss Breakdown</h3>
              <div className="flex items-center gap-4">
                <div className="flex-grow">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-green-500 font-medium">{result.winning_trades} Wins</span>
                    <span className="text-red-500 font-medium">{result.losing_trades} Losses</span>
                  </div>
                  <div className="h-3 w-full bg-red-500/30 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }}
                      animate={{ width: `${result.total_trades > 0 ? (result.winning_trades / result.total_trades * 100) : 0}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-green-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <h3 className="text-lg font-bold mb-4">Capital Growth</h3>
              <div className="flex items-end gap-4">
                <div className="flex-grow">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Start: {formatCurrencyINR(result.initial_capital)}</span>
                    <span className={result.total_return_pct >= 0 ? 'text-green-500' : 'text-red-500'}>End: {formatCurrencyINR(result.final_value)}</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }}
                      animate={{ width: `${Math.min(Math.max((result.final_value / (result.initial_capital * 2)) * 100, 5), 100)}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full rounded-full ${result.total_return_pct >= 0 ? 'bg-brand-primary' : 'bg-red-500'}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trade Log */}
          {result.trades.length > 0 && (
            <div className="glass-card">
              <h3 className="text-lg font-bold mb-4">Trade Log ({result.trades.length} entries)</h3>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-dark-card">
                    <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                      <th className="pb-3 font-medium">#</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Action</th>
                      <th className="pb-3 font-medium">Price</th>
                      <th className="pb-3 font-medium">Shares</th>
                      <th className="pb-3 font-medium">Value</th>
                      <th className="pb-3 font-medium text-right">Portfolio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {result.trades.map((t, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="py-2 text-xs text-gray-500">{i + 1}</td>
                        <td className="py-2 text-xs font-mono">{t.date}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.action.includes('BUY') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {t.action}
                          </span>
                        </td>
                        <td className="py-2 font-mono text-xs">{formatCurrencyINR(t.price)}</td>
                        <td className="py-2 font-mono text-xs">{t.shares}</td>
                        <td className="py-2 font-mono text-xs">{formatCurrencyINR(t.value)}</td>
                        <td className="py-2 font-mono text-xs text-right">{formatCurrencyINR(t.portfolio_value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-yellow-500 text-xs">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <p>
              <strong>Disclaimer:</strong> Backtesting results are based on historical data and do not guarantee future performance.
              Past returns do not predict future results. Always do your own research before investing real money.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Backtest;
