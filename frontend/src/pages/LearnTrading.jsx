import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Search, ChevronRight, ChevronDown,
  Sparkles, Shield, BarChart3, Target, Zap, Trophy, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { stockService } from '../services/stockService';

const categoryIcons = {
  basics: BookOpen,
  indicators: BarChart3,
  risk: Shield,
  signals: Target,
  strategy: Zap,
};

const categoryColors = {
  basics: 'text-blue-400 bg-blue-400/10',
  indicators: 'text-purple-400 bg-purple-400/10',
  risk: 'text-red-400 bg-red-400/10',
  signals: 'text-green-400 bg-green-400/10',
  strategy: 'text-yellow-400 bg-yellow-400/10',
};

const difficultyColors = {
  beginner: 'text-green-500 bg-green-500/10',
  intermediate: 'text-yellow-500 bg-yellow-500/10',
  advanced: 'text-red-500 bg-red-500/10',
};

const LearnTrading = () => {
  const [lessons, setLessons] = useState([]);
  const [glossary, setGlossary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('lessons');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonsRes, glossaryRes] = await Promise.all([
          stockService.getLessons(),
          stockService.getGlossary(),
        ]);
        setLessons(lessonsRes.data);
        setGlossary(glossaryRes.data);
      } catch (err) {
        console.error('Failed to fetch learning data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredLessons = lessons.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || l.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredGlossary = glossary.filter(g =>
    g.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ['all', ...new Set(lessons.map(l => l.category))];

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="h-8 w-64 bg-white/5 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-white/5 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Hero Header */}
      <div className="glass-card bg-gradient-to-br from-brand-secondary/10 via-transparent to-brand-primary/5 border-brand-secondary/20">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-brand-secondary/20">
              <GraduationCap size={32} className="text-brand-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Learn Trading</h1>
              <p className="text-gray-400 mt-1">Your AI-powered guide to understanding the stock market — from zero to confident.</p>
            </div>
          </div>
          <Link to="/paper-trading"
            className="btn-primary py-2 px-6 text-sm flex items-center gap-2">
            Practice with Paper Trading <ArrowRight size={16} />
          </Link>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-primary">{lessons.length}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Lessons</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-secondary">{glossary.length}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Glossary Terms</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">3</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Difficulty Levels</p>
          </div>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search lessons and glossary..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-brand-secondary/50 transition-all text-sm" />
        </div>
        <div className="flex gap-2">
          {['lessons', 'glossary'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-brand-secondary text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons Tab */}
      {activeTab === 'lessons' && (
        <>
          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filterCategory === cat ? 'bg-brand-secondary text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Lesson Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map(lesson => {
              const CatIcon = categoryIcons[lesson.category] || BookOpen;
              const isOpen = activeLesson === lesson.id;

              return (
                <motion.div key={lesson.id} layout
                  className={`glass-card cursor-pointer transition-all hover:border-brand-secondary/30 ${isOpen ? 'md:col-span-2 lg:col-span-3' : ''}`}
                  onClick={() => setActiveLesson(isOpen ? null : lesson.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl ${categoryColors[lesson.category] || 'bg-white/5'}`}>
                        <CatIcon size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{lesson.emoji}</span>
                          <h3 className="font-bold text-sm">{lesson.title}</h3>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${difficultyColors[lesson.difficulty]}`}>
                            {lesson.difficulty}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-gray-500 capitalize">
                            {lesson.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isOpen ? <ChevronDown size={16} className="text-gray-500 mt-1" /> : <ChevronRight size={16} className="text-gray-500 mt-1" />}
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-white/5">
                        <div className="prose prose-invert prose-sm max-w-none">
                          {lesson.content.split('\n\n').map((para, i) => (
                            <p key={i} className="text-gray-300 text-sm leading-relaxed mb-3 last:mb-0"
                              dangerouslySetInnerHTML={{
                                __html: para
                                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                                  .replace(/\n/g, '<br />')
                              }} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {filteredLessons.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No lessons found</p>
              <p className="text-sm mt-1">Try a different search term or category.</p>
            </div>
          )}
        </>
      )}

      {/* Glossary Tab */}
      {activeTab === 'glossary' && (
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BookOpen size={20} className="text-brand-secondary" /> Trading Glossary
          </h2>
          <div className="divide-y divide-white/5">
            {filteredGlossary.map((item, i) => (
              <div key={i} className="py-4 first:pt-0 last:pb-0">
                <h4 className="font-bold text-sm text-brand-primary mb-1">{item.term}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{item.definition}</p>
              </div>
            ))}
          </div>
          {filteredGlossary.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No terms found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="glass-card bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 text-center">
        <Sparkles className="text-brand-primary mx-auto mb-3" size={28} />
        <h3 className="text-xl font-bold mb-2">Ready to Practice?</h3>
        <p className="text-gray-400 text-sm mb-4">Apply what you've learned with our Paper Trading simulator. No real money at risk!</p>
        <div className="flex justify-center gap-3">
          <Link to="/paper-trading" className="btn-primary py-2 px-6 text-sm">Start Paper Trading</Link>
          <Link to="/backtest" className="btn-outline py-2 px-6 text-sm">Try Backtesting</Link>
        </div>
      </div>
    </div>
  );
};

export default LearnTrading;
