import api from './api';

const tradeService = {
  getTradeDashboard: async () => {
    return api.get('/trade/dashboard');
  },
  
  getMarketPrice: async () => {
    return api.get('/trade/market-price');
  },
  
  getMarketPriceHistory: async (days = 30) => {
    return api.get('/trade/market-price/history', { params: { days } });
  },
  
  getTrades: async (params = {}) => {
    return api.get('/trade/trades', { params });
  },
  
  getTrade: async (tradeId) => {
    return api.get(`/trade/trades/${tradeId}`);
  },
  
  createTrade: async (tradeData) => {
    return api.post('/trade/trades', tradeData);
  },
  
  updateTradeStatus: async (tradeId, status) => {
    return api.put(`/trade/trades/${tradeId}/status`, { status });
  }
};

export default tradeService;