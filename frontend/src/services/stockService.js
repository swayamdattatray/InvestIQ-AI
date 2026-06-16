import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const stockService = {
  getStockData: (symbol) => api.get(`/stock/${symbol}`),
  getStockAnalysis: (symbol) => api.get(`/stock/${symbol}/analysis`),
};

export default api;
