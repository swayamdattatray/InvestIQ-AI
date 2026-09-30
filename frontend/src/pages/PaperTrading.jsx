import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  RefreshCw, History, ShoppingCart, DollarSign, RotateCcw, X, Check, AlertCircle
} from 'lucide-react';
import { stockService } from '../services/stockService';
import { formatCurrencyINR, formatNumberIN } from '../utils/formatters';

const PaperTrading = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tradeModal, setTradeModal] = useState(null); // { action: 'BUY' | 'SELL' }
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradeQty, setTradeQty] = useState('');
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [tradeSuccess, setTradeSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('portfolio');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, hRes] = await Promise.all([
        stockService.getPortfolio(),
        stockService.getTradeHistory(),
      ]);
      setPortfolio(pRes.data);
      setHistory(hRes.data);
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTrade = async () => {
    if (!tradeSymbol.trim() || !tradeQty || parseInt(tradeQty) <= 0) {
      setTradeError('Enter a valid symbol and quantity');
      return;
    }
    setTradeLoading(true);
    setTradeError('');
    setTradeSuccess('');
    try {
      const res = await stockService.executeTrade(
        tradeSymbol.trim().toUpperCase(),
        tradeModal.action,
        parseInt(tradeQty)
      );
      setTradeSuccess(res.data.message);
      setTradeSymbol('');
      setTradeQty('');
      setTimeout(() => {
        setTradeModal(null);
        setTradeSuccess('');
        fetchData();
      }, 1500);
    } catch (err) {
      setTradeError(err.response?.data?.detail || 'Trade failed');
    } finally {
      setTradeLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset your entire paper trading portfolio to ₹10,00,000?')) return;
    try {
      await stockService.resetPortfolio();
      fetchData();
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="h-8 w-64 bg-white/5 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold">Paper Trading</h1>
          <p className="text-gray-500 mt-1">Practice trading with ₹10,00,000 virtual cash. No real money at risk.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setTradeModal({ action: 'BUY' })}
            className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
            <ShoppingCart size={16} /> Buy
          </button>
          <button onClick={() => setTradeModal({ action: 'SELL' })}
            className="btn-outline py-2 px-4 text-sm flex items-center gap-2">
            <DollarSign size={16} /> Sell
          </button>
          <button onClick={handleReset}
            className="py-2 px-4 text-sm flex items-center gap-2 text-gray-400 hover:text-white border border-white/10 rounded-lg transition-colors">
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* Portfolio Stats */}
      {portfolio && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Total Value</p>
            <h2 className="text-2xl font-bold font-mono">{formatCurrencyINR(portfolio.total_value)}</h2>
            <div className={`flex items-center gap-1 text-sm mt-2 font-medium ${portfolio.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {portfolio.total_pnl >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {portfolio.total_pnl >= 0 ? '+' : ''}{formatCurrencyINR(portfolio.total_pnl)} ({portfolio.total_pnl_percent}%)
            </div>
          </div>
          <div className="glass-card">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Cash Available</p>
            <h2 className="text-2xl font-bold font-mono">{formatCurrencyINR(portfolio.cash_balance)}</h2>
            <p className="text-xs text-gray-500 mt-2">Ready to invest</p>
          </div>
          <div className="glass-card">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Invested</p>
            <h2 className="text-2xl font-bold font-mono">{formatCurrencyINR(portfolio.invested_value)}</h2>
            <p className="text-xs text-gray-500 mt-2">In {portfolio.holdings.length} stocks</p>
          </div>
          <div className="glass-card">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Current Value</p>
            <h2 className="text-2xl font-bold font-mono">{formatCurrencyINR(portfolio.current_value)}</h2>
            <p className="text-xs text-gray-500 mt-2">Market value of holdings</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-0">
        {['portfolio', 'history'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-white'}`}>
            {tab === 'portfolio' ? 'Holdings' : 'Trade History'}
          </button>
        ))}
      </div>

      {/* Holdings Table */}
      {activeTab === 'portfolio' && portfolio && (
        <div className="glass-card">
          {portfolio.holdings.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Wallet size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No holdings yet</p>
              <p className="text-sm mt-1">Buy your first stock to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                    <th className="pb-4 font-medium">Stock</th>
                    <th className="pb-4 font-medium">Qty</th>
                    <th className="pb-4 font-medium">Avg Cost</th>
                    <th className="pb-4 font-medium">Current</th>
                    <th className="pb-4 font-medium">Invested</th>
                    <th className="pb-4 font-medium">Current Val</th>
                    <th className="pb-4 font-medium text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {portfolio.holdings.map(h => (
                    <tr key={h.symbol} className="hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center font-bold text-brand-primary text-xs">{h.symbol[0]}</div>
                          <span className="font-bold text-sm">{h.symbol}</span>
                        </div>
                      </td>
                      <td className="py-4 font-mono text-sm">{h.quantity}</td>
                      <td className="py-4 font-mono text-xs text-gray-400">{formatCurrencyINR(h.avg_price)}</td>
                      <td className="py-4 font-mono text-sm">{formatCurrencyINR(h.current_price)}</td>
                      <td className="py-4 font-mono text-xs text-gray-400">{formatCurrencyINR(h.invested_value)}</td>
                      <td className="py-4 font-mono text-sm">{formatCurrencyINR(h.current_value)}</td>
                      <td className="py-4 text-right">
                        <div className={`font-bold text-sm ${h.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {h.pnl >= 0 ? '+' : ''}{formatCurrencyINR(h.pnl)}
                        </div>
                        <div className={`text-[10px] ${h.pnl_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {h.pnl_percent >= 0 ? '+' : ''}{h.pnl_percent}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Trade History */}
      {activeTab === 'history' && history && (
        <div className="glass-card">
          {history.trades.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <History size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No trades yet</p>
              <p className="text-sm mt-1">Your trade history will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                    <th className="pb-4 font-medium">#</th>
                    <th className="pb-4 font-medium">Action</th>
                    <th className="pb-4 font-medium">Stock</th>
                    <th className="pb-4 font-medium">Qty</th>
                    <th className="pb-4 font-medium">Price</th>
                    <th className="pb-4 font-medium">Total</th>
                    <th className="pb-4 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.trades.map(t => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 text-xs text-gray-500">{t.id}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.action === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {t.action}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-sm">{t.symbol}</td>
                      <td className="py-3 font-mono text-sm">{t.quantity}</td>
                      <td className="py-3 font-mono text-sm">{formatCurrencyINR(t.price)}</td>
                      <td className="py-3 font-mono text-sm">{formatCurrencyINR(t.total_value)}</td>
                      <td className="py-3 text-right text-xs text-gray-500">
                        {new Date(t.timestamp).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Trade Modal */}
      <AnimatePresence>
        {tradeModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { setTradeModal(null); setTradeError(''); setTradeSuccess(''); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-dark-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {tradeModal.action === 'BUY' ?
                    <><ShoppingCart className="text-green-500" size={20} /> Buy Stock</> :
                    <><DollarSign className="text-red-500" size={20} /> Sell Stock</>
                  }
                </h3>
                <button onClick={() => { setTradeModal(null); setTradeError(''); setTradeSuccess(''); }}
                  className="p-1 text-gray-500 hover:text-white"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Stock Symbol</label>
                  <input type="text" value={tradeSymbol} onChange={e => setTradeSymbol(e.target.value)}
                    placeholder="e.g. AAPL, IBM, MSFT" autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-primary/50 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Quantity</label>
                  <input type="number" value={tradeQty} onChange={e => setTradeQty(e.target.value)}
                    placeholder="Number of shares" min="1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-primary/50 transition-all text-sm" />
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
                  {tradeLoading ? 'Processing...' : `${tradeModal.action} Shares`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaperTrading;
