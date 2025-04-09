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
}

export default TradingService
