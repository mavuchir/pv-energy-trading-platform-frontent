import api from "./api"

const TradingService = {
  // Get market price
  getMarketPrice: async () => {
    try {
      const response = await api.get("/trade/market-price")
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching market price:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch market price" }
    }
  },

  // Get available trades
  getAvailableTrades: async (communityId = null, maxPrice = null, minAmount = 0.1) => {
    try {
      let url = "/trade/available-trades?min_amount=" + minAmount
      if (communityId) url += `&community_id=${communityId}`
      if (maxPrice) url += `&max_price=${maxPrice}`

      const response = await api.get(url)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching available trades:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch available trades" }
    }
  },

  // Get my trades
  getMyTrades: async (role = "all", status = "all", limit = 20, offset = 0) => {
    try {
      const response = await api.get(`/trade/my-trades?role=${role}&status=${status}&limit=${limit}&offset=${offset}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching my trades:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch my trades" }
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
      const response = await api.post("/trade/buy-energy", { trade_id: tradeId })
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error buying trade:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to buy trade" }
    }
  },

  // Cancel a trade
  cancelTrade: async (tradeId) => {
    try {
      const response = await api.post(`/trade/cancel-trade/${tradeId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error cancelling trade:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to cancel trade" }
    }
  },

  // Rate a completed trade
  rateTrade: async (tradeId, rating) => {
    try {
      const response = await api.post(`/trade/rate/${tradeId}`, { rating })
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error rating trade:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to rate trade" }
    }
  },

  // Get trade history
  getTradeHistory: async (days = 30) => {
    try {
      const response = await api.get(`/trade/history?days=${days}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching trade history:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch trade history" }
    }
  },

  // Get account information including balance and transactions
  getAccountInfo: async () => {
    try {
      const response = await api.get("/trade/account-info")
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching account info:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch account information" }
    }
  },

  // Get energy prices
  getMarketPrices: async () => {
    try {
      const response = await api.get("/trade/market-price")
      return {
        success: true,
        data: {
          current: {
            grid_import: response.data?.grid_import || 0,
            grid_export: response.data?.grid_export || 0,
            p2p: response.data?.p2p || 0,
            timestamp: response.data?.timestamp || new Date().toISOString(),
          },
          historical: response.data?.historical || [],
        },
      }
    } catch (error) {
      console.error("Error fetching energy prices:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch energy prices",
        data: {
          current: {
            grid_import: 0,
            grid_export: 0,
            p2p: 0,
            timestamp: new Date().toISOString(),
          },
          historical: [],
        },
      }
    }
  },
}

export default TradingService
