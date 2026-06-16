import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatNumberIN } from '../../utils/formatters';

const MarketIndices = () => {
  const indices = [
    { name: 'NIFTY 50', value: 23465.60, change: '+124.50', percent: '0.53%', up: true },
    { name: 'SENSEX', value: 77337.59, change: '+321.40', percent: '0.42%', up: true },
    { name: 'Gold (₹/g)', value: 7245.00, change: '+15.00', percent: '0.21%', up: true },
    { name: 'Silver (₹/g)', value: 89.50, change: '-0.30', percent: '0.33%', up: false },
    { name: 'Petrol (₹/L)', value: 104.21, change: '0.00', percent: '0.00%', up: true },
    { name: 'Diesel (₹/L)', value: 92.15, change: '0.00', percent: '0.00%', up: true },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
      {indices.map((index) => (
        <motion.div
          key={index.name}
          whileHover={{ y: -2 }}
          className="flex-shrink-0 glass-card !p-4 min-w-[180px] border-white/5"
        >
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">{index.name}</span>
            {index.up ? <ArrowUpRight size={12} className="text-green-500" /> : <ArrowDownRight size={12} className="text-red-500" />}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-md font-bold font-mono">₹{formatNumberIN(index.value, index.value > 1000 ? 2 : 2)}</span>
          </div>
          <div className={`text-[10px] font-bold ${index.up ? 'text-green-500' : 'text-red-500'}`}>
            {index.change} ({index.percent})
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MarketIndices;
