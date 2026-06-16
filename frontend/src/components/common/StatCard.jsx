import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, change, icon: Icon, color = "brand-primary" }) => {
  const isPositive = change?.startsWith('+');

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-${color}/10 text-${color}`}>
          <Icon size={20} />
        </div>
        {change && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
    </motion.div>
  );
};

export default StatCard;
