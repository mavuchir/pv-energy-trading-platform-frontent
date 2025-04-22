import api from "./api";

const tradingService = {
  // Get trades for the current user with optional filters
  getTrades: async (role = 'all', status = null, community_id = null, startDate = null, endDate = null) => {
    try {
      let url = "/trading/trades?";
      const params = new URLSearchParams();
      if (role !== 'all') params.append('role', role);
      if (status) params.append('status', status);
      if (community_id) params.append('community_id', community_id);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      url += params.toString();

      const response = await api.get(url);
      return { success: true, trades: response.data.trades || [], count: response.data.count || 0 };
    } catch (error) {
      console.error("Error fetching trades:", error);
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch trades",
      };
    }
  },

  // Get a specific trade by ID
  getTrade: async (tradeId) => {
    try {
      const response = await api.get(`/trading/trades/${tradeId}`);
      return { success: true, trade: response.data };
    } catch (error) {
      console.error(`Error fetching trade ${tradeId}:`, error);
      return {
        success: false,
        error: error.response?.data?.msg || `Failed to fetch trade ${tradeId}`,
      };
    }
  },

  // Create a new trade
  createTrade: async (tradeData) => {
    try {
      const response = await api.post("/trading/trades", tradeData);
      return { success: true, trade: response.data.trade };
    } catch (error) {
      console.error("Error creating trade:", error);
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to create trade",
      };
    }
  },

  // Update a trade's status
  updateTradeStatus: async (tradeId, status) => {
    try {
      const response = await api.put(`/trading/trades/${tradeId}/status`, { status });
      return { success: true, trade: response.data.trade };
    } catch (error) {
      console.error(`Error updating trade ${tradeId} status:`, error);
      return {
        success: false,
        error: error.response?.data?.msg || `Failed to update trade ${tradeId} status`,
      };
    }
  },

  // Get current market price
  getMarketPrice: async () => {
    try {
      const response = await api.get("/trading/market-price");
      return { success: true, price: response.data.price, timestamp: response.data.timestamp, source: response.data.source };
    } catch (error) {
      console.error("Error fetching market price:", error);
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch market price",
      };
    }
  },

  // Get market price history
  getMarketPriceHistory: async (days = 30) => {
    try {
      const response = await api.get(`/trading/market-price/history?days=${days}`);
      return { success: true, prices: response.data.prices || [], count: response.data.count || 0 };
    } catch (error) {
      console.error("Error fetching market price history:", error);
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch market price history",
      };
    }
  },

  // Get trade dashboard data
  getTradeDashboard: async () => {
    try {
      const response = await api.get("/trading/dashboard");
      return { success: true, dashboardData: response.data };
    } catch (error) {
      console.error("Error fetching trade dashboard data:", error);
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch trade dashboard data",
      };
    }
  },
};

export default tradingService;