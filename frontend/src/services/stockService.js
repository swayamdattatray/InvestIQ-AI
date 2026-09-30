import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const stockService = {
  // Existing
  getStockData: (symbol) => api.get(`/stock/${symbol}`),
  getStockAnalysis: (symbol) => api.get(`/stock/${symbol}/analysis`),

  // Paper Trading
  executeTrade: (symbol, action, quantity) =>
    api.post('/paper-trade/execute', { symbol, action, quantity }),
  getPortfolio: () => api.get('/paper-trade/portfolio'),
  getTradeHistory: () => api.get('/paper-trade/history'),
  resetPortfolio: () => api.post('/paper-trade/reset'),

  // Backtesting
  runBacktest: (symbol, params = {}) => api.post(`/backtest/${symbol}`, params),

  // AI Guide
  getLessons: () => api.get('/ai-guide/lessons'),
  getLesson: (id) => api.get(`/ai-guide/lessons/${id}`),
  getGlossary: () => api.get('/ai-guide/glossary'),
  explainStock: (symbol) => api.get(`/ai-guide/explain/${symbol}`),
};

export default api;
