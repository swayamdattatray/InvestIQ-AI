import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import {
  Bot, X, BookOpen, Sparkles, ArrowRight, ChevronRight,
  Loader2, AlertTriangle, TrendingUp, Shield, GraduationCap
} from 'lucide-react';
import { stockService } from '../../services/stockService';

const AIGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('guide');
  const [quickTips] = useState([
    { icon: '📝', text: 'New to trading? Start with Paper Trading to practice risk-free!', link: '/paper-trading' },
    { icon: '📚', text: 'Learn what RSI, Moving Averages, and signals mean.', link: '/learn' },
    { icon: '🔬', text: 'Test strategies on historical data with the Backtester.', link: '/backtest' },
    { icon: '🛡️', text: 'Always check the Risk Assessment before buying any stock.' },
    { icon: '⚠️', text: 'Never invest money you can\'t afford to lose. This is a learning tool.' },
  ]);
  const location = useLocation();

  // Detect if we're on a stock detail page
  const stockMatch = location.pathname.match(/^\/stock\/(.+)$/);
  const currentSymbol = stockMatch ? decodeURIComponent(stockMatch[1]) : null;

  useEffect(() => {
    if (isOpen && currentSymbol && !guidance) {
      fetchGuidance(currentSymbol);
    }
  }, [isOpen, currentSymbol]);

  const fetchGuidance = async (symbol) => {
    setLoading(true);
    setGuidance(null);
    try {
      const res = await stockService.explainStock(symbol);
      setGuidance(res.data);
    } catch (err) {
      console.error('Failed to fetch guidance:', err);
      setGuidance({ error: err.response?.data?.detail || 'Could not load guidance for this stock.' });
    } finally {
      setLoading(false);
    }
  };

  // Reset guidance when navigating away from stock pages
  useEffect(() => {
    if (!currentSymbol) {
      setGuidance(null);
    }
  }, [location.pathname]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all ${
          isOpen
            ? 'bg-white/10 text-gray-400 hover:text-white'
            : 'bg-gradient-to-r from-brand-secondary to-brand-primary text-dark'
        }`}
        style={{ boxShadow: isOpen ? 'none' : '0 0 30px rgba(83, 103, 255, 0.4)' }}
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </motion.button>

      {/* Pulse ring on button when closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-brand-secondary/20 animate-ping" />
        </div>
      )}

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[70vh] bg-dark-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-brand-secondary/20 to-brand-primary/10 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-brand-secondary/30">
                  <Sparkles size={18} className="text-brand-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Trading Mentor</h3>
                  <p className="text-[10px] text-gray-500">
                    {currentSymbol ? `Analyzing ${currentSymbol}` : 'Your beginner-friendly guide'}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              {currentSymbol && (
                <div className="flex gap-1 mt-3">
                  {['guide', 'analysis'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        activeTab === tab
                          ? 'bg-brand-secondary text-white'
                          : 'text-gray-500 hover:text-white'
                      }`}>
                      {tab === 'guide' ? 'Quick Tips' : 'Stock Analysis'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3">

              {/* Quick Tips Tab */}
              {(activeTab === 'guide' || !currentSymbol) && (
                <>
                  {/* Context-aware greeting */}
                  <div className="p-3 rounded-xl bg-white/5 text-sm text-gray-300 leading-relaxed">
                    <p className="flex items-start gap-2">
                      <Bot size={16} className="text-brand-secondary flex-shrink-0 mt-0.5" />
                      {currentSymbol
                        ? `Hi! You're looking at ${currentSymbol}. I can explain what all the numbers mean. Switch to "Stock Analysis" for a detailed breakdown!`
                        : "Hi! 👋 I'm your AI Trading Mentor. I'll help you understand everything on this platform. Here are some tips to get started:"}
                    </p>
                  </div>

                  {quickTips.map((tip, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                    >
                      <span className="text-lg flex-shrink-0">{tip.icon}</span>
                      <div className="flex-grow">
                        <p className="text-xs text-gray-300 leading-relaxed">{tip.text}</p>
                        {tip.link && (
                          <Link to={tip.link} onClick={() => setIsOpen(false)}
                            className="text-[10px] text-brand-primary font-bold flex items-center gap-1 mt-1 hover:underline">
                            Try it <ArrowRight size={10} />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </>
              )}

              {/* Stock Analysis Tab */}
              {activeTab === 'analysis' && currentSymbol && (
                <>
                  {loading && (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      <Loader2 size={20} className="animate-spin mr-2" /> Analyzing {currentSymbol}...
                    </div>
                  )}

                  {guidance && guidance.error && (
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-xs flex items-start gap-2">
                      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                      {guidance.error}
                    </div>
                  )}

                  {guidance && !guidance.error && (
                    <>
                      {/* Signal Summary */}
                      <div className={`p-3 rounded-xl ${guidance.signal === 'BUY' ? 'bg-green-500/10' : guidance.signal === 'SELL' ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp size={14} className={guidance.signal === 'BUY' ? 'text-green-500' : guidance.signal === 'SELL' ? 'text-red-500' : 'text-yellow-500'} />
                          <span className={`text-xs font-bold ${guidance.signal === 'BUY' ? 'text-green-500' : guidance.signal === 'SELL' ? 'text-red-500' : 'text-yellow-500'}`}>
                            Signal: {guidance.signal}
                          </span>
                          <span className={`ml-auto px-2 py-0.5 rounded text-[9px] font-bold ${guidance.risk_level === 'LOW' ? 'bg-green-500/20 text-green-500' : guidance.risk_level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>
                            {guidance.risk_level} RISK
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">{guidance.summary?.replace(/\*\*/g, '')}</p>
                      </div>

                      {/* Detailed Analysis */}
                      <div className="space-y-2">
                        {guidance.detailed_analysis?.split('\n\n').slice(1).map((para, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white/5 text-xs text-gray-300 leading-relaxed">
                            {para.replace(/\*\*/g, '')}
                          </div>
                        ))}
                      </div>

                      {/* Warnings */}
                      {guidance.warnings?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle size={10} /> Warnings
                          </p>
                          {guidance.warnings.map((w, i) => (
                            <div key={i} className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-[11px] text-red-300">
                              {w}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tips */}
                      {guidance.tips?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Sparkles size={10} /> Tips for You
                          </p>
                          {guidance.tips.map((t, i) => (
                            <div key={i} className="p-2 rounded-lg bg-green-500/5 border border-green-500/10 text-[11px] text-green-300">
                              ✅ {t}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Recommended Lessons */}
                      {guidance.recommended_lessons?.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                            <GraduationCap size={10} /> Recommended Reading
                          </p>
                          <Link to="/learn" onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 p-3 rounded-xl bg-brand-secondary/10 border border-brand-secondary/20 text-xs text-brand-secondary font-medium hover:bg-brand-secondary/20 transition-all">
                            <BookOpen size={14} /> View related lessons to understand this analysis
                            <ChevronRight size={14} className="ml-auto" />
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/5 flex-shrink-0">
              <Link to="/learn" onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-xs text-gray-400 hover:text-white font-medium">
                <GraduationCap size={14} /> Open Full Learning Center <ArrowRight size={12} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIGuide;
