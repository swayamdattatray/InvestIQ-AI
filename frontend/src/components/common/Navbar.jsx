import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, LayoutDashboard, Briefcase, Search } from 'lucide-react';
import { motion } from 'framer-motion';

import GlobalSearch from './GlobalSearch';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-dark/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="bg-brand-primary p-1.5 rounded-lg">
            <TrendingUp size={20} className="text-dark" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:inline">InvestIQ<span className="text-brand-primary">AI</span></span>
        </Link>

        <div className="flex-grow max-w-xl hidden md:block">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-8 mr-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-brand-primary ${
                    isActive ? 'text-brand-primary' : 'text-gray-400'
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
              <Search size={20} />
            </button>
            <Link to="/dashboard" className="btn-primary py-1.5 px-4 text-sm whitespace-nowrap">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
