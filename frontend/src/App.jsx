import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stock/:symbol" element={<StockDetail />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
