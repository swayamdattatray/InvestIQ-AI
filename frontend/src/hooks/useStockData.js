import { useState, useEffect } from 'react';
import { stockService } from '../services/stockService';

export const useStockData = (symbol) => {
  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStock = async (sym) => {
    if (!sym) return;
    setLoading(true);
    setError(null);
    try {
      const [dataRes, analysisRes] = await Promise.all([
        stockService.getStockData(sym),
        stockService.getStockAnalysis(sym)
      ]);
      setData(dataRes.data);
      setAnalysis(analysisRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch stock information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock(symbol);
  }, [symbol]);

  return { data, analysis, loading, error, refetch: () => fetchStock(symbol) };
};
