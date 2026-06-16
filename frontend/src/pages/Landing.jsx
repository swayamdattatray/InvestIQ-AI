import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldCheck, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const features = [
    {
      title: 'Real-time Analytics',
      description: 'Get live market data and instant technical indicators for any stock.',
      icon: Zap,
    },
    {
      title: 'AI Signal Intelligence',
      description: 'Sophisticated algorithms generating Buy/Hold/Sell signals based on MA & RSI.',
      icon: BarChart3,
    },
    {
      title: 'Secure Portfolio',
      description: 'Track your investments with professional-grade privacy and security.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="flex flex-col gap-24 py-12">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center gap-8 py-20 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 -z-10 h-full w-full overflow-hidden">
          <div className="absolute -top-[10%] left-[10%] h-[500px] w-[500px] rounded-full bg-brand-primary/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-[10%] h-[400px] w-[400px] rounded-full bg-brand-secondary/10 blur-[120px] animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-brand-primary mb-4"
        >
          <TrendingUp size={16} />
          <span>New: AI Analysis v2.0 is now live</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight"
        >
          AI-Powered <span className="gradient-text">Investment</span> Intelligence Platform
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed"
        >
          Transform your trading with data-driven insights. InvestIQ-AI analyzes market trends, 
          technical indicators, and volatility to help you make smarter financial decisions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-4"
        >
          <Link to="/dashboard" className="btn-primary py-3 px-8 text-lg flex items-center gap-2 group">
            Go to Dashboard
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="btn-outline py-3 px-8 text-lg">
            View Features
          </button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-card hover:border-brand-primary/30 group"
            >
              <div className="bg-brand-primary/10 p-3 rounded-xl w-fit mb-6 group-hover:bg-brand-primary/20 transition-colors">
                <Icon className="text-brand-primary" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </motion.section>

      {/* Trust Banner / Stats */}
      <section className="glass rounded-3xl p-12 flex flex-wrap justify-around items-center gap-8 text-center border-white/5">
        <div>
          <h4 className="text-3xl font-bold text-white mb-1">500+</h4>
          <p className="text-gray-500 text-sm uppercase tracking-widest">Stocks Tracked</p>
        </div>
        <div className="h-12 w-[1px] bg-white/10 hidden md:block" />
        <div>
          <h4 className="text-3xl font-bold text-white mb-1">98.2%</h4>
          <p className="text-gray-500 text-sm uppercase tracking-widest">Uptime</p>
        </div>
        <div className="h-12 w-[1px] bg-white/10 hidden md:block" />
        <div>
          <h4 className="text-3xl font-bold text-white mb-1">24/7</h4>
          <p className="text-gray-500 text-sm uppercase tracking-widest">AI Monitoring</p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
