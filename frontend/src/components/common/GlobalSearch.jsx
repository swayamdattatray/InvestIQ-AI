import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const suggestions = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Energy' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT' },
    { symbol: 'INFY.NS', name: 'Infosys Limited', sector: 'IT' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', sector: 'Banking' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Limited', sector: 'Banking' },
    { symbol: 'ZOMATO.NS', name: 'Zomato Limited', sector: 'Consumer' },
    { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Limited', sector: 'Auto' },
  ];

  const filtered = suggestions.filter(s => 
    s.symbol.toLowerCase().includes(query.toLowerCase()) || 
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (symbol) => {
    navigate(`/stock/${symbol}`);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full md:w-96">
      <div className="relative">
        <input
          type="text"
          placeholder="Search Indian stocks (e.g. RELIANCE)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-brand-primary/50 transition-all text-xs"
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {filtered.length > 0 ? (
                <div className="py-2">
                  <p className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">NSE Suggestions</p>
                  {filtered.map((s) => (
                    <button
                      key={s.symbol}
                      onClick={() => handleSelect(s.symbol)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-brand-primary/10 flex items-center justify-center font-bold text-brand-primary text-[10px]">
                          {s.symbol[0]}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{s.symbol}</div>
                          <div className="text-[10px] text-gray-500">{s.name}</div>
                        </div>
                      </div>
                      <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-gray-400 font-bold">{s.sector}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No NSE results found for "{query}"
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch;
