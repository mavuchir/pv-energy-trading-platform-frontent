import api from "../config/axios"

const TradingService = {
  /**
   * Get market overview data
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  getMarketOverview: async () => {
    try {
      const response = await api.get("/trade/market-overview")
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching market overview:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch market overview",
      }
    }
  },

  /**
   * Get user's trading history
   * @param {number} limit - Maximum number of trades to return
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  getUserTrades: async (limit = 10) => {
    try {
      const response = await api.get(`/trade/user-trades?limit=${limit}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching user trades:", error)
      return {
        success: false,
        data: { trades: [] },
        error: error.response?.data?.msg || "Failed to fetch trading history",
      }
    }
  },

  /**
   * Create a new sell order
   * @param {Object} orderData - The sell order data
   * @param {number} orderData.amount - Amount of energy to sell in kWh
   * @param {number} [orderData.price_per_kwh] - Price per kWh (if not provided, uses recommended P2P price)
   * @param {number} [orderData.community_id] - If selling within a community
   * @param {number} [orderData.expiry_hours] - How long the offer should remain valid (default: 24 hours)
   * @param {boolean} [orderData.auto_price] - Whether to use dynamic pricing (default: false)
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  createSellOrder: async (orderData) => {
    try {
      const response = await api.post("/trade/create-sell-order", orderData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error creating sell order:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to create sell order",
      }
    }
  },

  /**
   * Buy energy from the marketplace
   * @param {Object} buyData - The buy order data
   * @param {string} [buyData.trade_id] - Specific trade to buy from
   * @param {number} [buyData.amount] - Amount of energy to buy (required if trade_id not provided)
   * @param {number} [buyData.max_price] - Maximum price willing to pay per kWh
   * @param {number} [buyData.community_id] - If buying within a community
   * @param {boolean} [buyData.auto_price] - Whether to use dynamic pricing (default: false)
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  buyEnergy: async (buyData) => {
    try {
      const response = await api.post("/trade/buy-energy", buyData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error buying energy:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to buy energy",
      }
    }
  },

  /**
   * Cancel a pending trade
   * @param {string} tradeId - ID of the trade to cancel
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  cancelTrade: async (tradeId) => {
    try {
      const response = await api.post(`/trade/cancel-trade/${tradeId}`, {})
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error cancelling trade:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to cancel trade",
      }
    }
  },

  /**
   * Sell energy to the grid
   * @param {number} amount - Amount of energy to sell in kWh
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  sellToGrid: async (amount) => {
    try {
      const response = await api.post("/trade/sell-to-grid", { amount })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error selling to grid:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to sell energy to grid",
      }
    }
  },

  /**
   * Buy energy from the grid
   * @param {number} amount - Amount of energy to buy in kWh
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  buyFromGrid: async (amount) => {
    try {
      const response = await api.post("/trade/buy-from-grid", { amount })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error buying from grid:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to buy energy from grid",
      }
    }
  },

  /**
   * Get energy optimization recommendations
   * @param {number} [amount] - Amount of energy to optimize (default: 1.0 kWh)
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  getEnergyOptimization: async (amount = 1.0) => {
    try {
      const response = await api.get(`/trade/energy-optimization?amount=${amount}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error getting energy optimization:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to get energy optimization",
      }
    }
  },

  /**
   * Get energy price forecast
   * @param {number} [hours] - Number of hours to forecast (default: 24)
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  getPriceForecast: async (hours = 24) => {
    try {
      const response = await api.get(`/trade/price-forecast?hours=${hours}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error getting price forecast:", error)
      return {
        success: false,
        data: { forecast: [] },
        error: error.response?.data?.msg || "Failed to get price forecast",
      }
    }
  },

  /**
   * Get list of communities the user is a member of
   * @returns {Promise<{success: boolean, data: Array, error: string}>}
   */
  getUserCommunities: async () => {
    try {
      const response = await api.get("/community/list")
      // Filter only communities the user is a member of
      const userCommunities = response.data.communities.filter((c) => c.is_member)
      return {
        success: true,
        data: userCommunities,
      }
    } catch (error) {
      console.error("Error fetching communities:", error)
      return {
        success: false,
        data: [],
        error: error.response?.data?.msg || "Failed to fetch communities",
      }
    }
  },
}

export default TradingService

