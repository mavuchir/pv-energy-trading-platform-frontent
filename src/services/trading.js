import api from "./api"

const TradingService = {
  // Get market overview
  getMarketOverview: async () => {
    try {
      const response = await api.get("/trade/market-overview")
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching market overview:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch market overview" }
    }
  },

  // Get market data
  getMarketData: async (communityId = null) => {
    try {
      const url = communityId ? `/trade/market-data?community_id=${communityId}` : "/trade/market-data"
      const response = await api.get(url)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching market data:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch market data" }
    }
  },

  // Create sell order
  createSellOrder: async (orderData) => {
    try {
      const response = await api.post("/trade/create-sell-order", orderData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error creating sell order:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to create sell order" }
    }
  },

  // Buy energy
  buyEnergy: async (buyData) => {
    try {
      const response = await api.post("/trade/buy-energy", buyData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error buying energy:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to buy energy" }
    }
  },

  // Buy specific trade
  buyTrade: async (tradeId) => {
    try {
      const response = await api.post(`/trade/buy/${tradeId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error buying trade:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to buy trade" }
    }
  },

  // Cancel trade
  cancelTrade: async (tradeId) => {
    try {
      const response = await api.post(`/trade/cancel/${tradeId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error cancelling trade:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to cancel trade" }
    }
  },

  // Get trading history
  getTradingHistory: async (period = "all") => {
    try {
      const response = await api.get(`/trade/history?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching trading history:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch trading history" }
    }
  },

  // Get price forecast
  getPriceForecast: async () => {
    try {
      const response = await api.get("/trade/price-forecast")
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching price forecast:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch price forecast" }
    }
  },

  // Get optimal energy decision
  getOptimalEnergyDecision: async (amount) => {
    try {
      const response = await api.get(`/trade/optimal-decision?amount=${amount}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching optimal energy decision:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch optimal energy decision" }
    }
  },

  // Update trading preferences
  updateTradingPreferences: async (preferences) => {
    try {
      const response = await api.post("/trade/preferences", preferences)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error updating trading preferences:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to update trading preferences" }
    }
  },
}

export default TradingService

