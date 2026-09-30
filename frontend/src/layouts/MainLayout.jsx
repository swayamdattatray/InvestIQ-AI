import React from 'react';
import Navbar from '../components/common/Navbar';
import AIGuide from '../components/common/AIGuide';
import { motion } from 'framer-motion';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark text-gray-100 flex flex-col">
      <Navbar />
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex-grow container mx-auto px-4 py-8"
      >
        {children}
      </motion.main>
      <footer className="border-t border-white/10 py-8 bg-dark/50">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} InvestIQ-AI. Built for Modern Investors.
        </div>
      </footer>
      <AIGuide />
    </div>
  );
};

export default MainLayout;
