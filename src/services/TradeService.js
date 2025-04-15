import api from "./api"

class TradeService {
  // Get trade summary
  static async getTradeSummary() {
    try {
      const response = await api.get("/trade/summary")
      return response.data
    } catch (error) {
      console.error("Get trade summary error:", error)
      return { sold: 0, bought: 0, balance: 0 }
    }
  }

  // Get trade history
  static async getTradeHistory(period = "month") {
    try {
      const response = await api.get(`/trade/history?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Get trade history error:", error)
      return { history: [] }
    }
  }

  // Get current market prices
  static async getMarketPrices() {
    try {
      const response = await api.get("/trade/prices")
      return response.data
    } catch (error) {
      console.error("Get market prices error:", error)
      return { buy_price: 0, sell_price: 0 }
    }
  }

  // Get price forecast
  static async getPriceForecast(hours = 24) {
    try {
      const response = await api.get(`/trade/price-forecast?hours=${hours}`)
      return response.data
    } catch (error) {
      console.error("Get price forecast error:", error)
      return { forecast: [] }
    }
  }

  // Create sell order
  static async createSellOrder(orderData) {
    try {
      const response = await api.post("/trade/sell", orderData)
      return response.data
    } catch (error) {
      console.error("Create sell order error:", error)
      throw error
    }
  }

  // Create buy order
  static async createBuyOrder(orderData) {
    try {
      const response = await api.post("/trade/buy", orderData)
      return response.data
    } catch (error) {
      console.error("Create buy order error:", error)
      throw error
    }
  }

  // Get active orders
  static async getActiveOrders() {
    try {
      const response = await api.get("/trade/orders/active")
      return response.data
    } catch (error) {
      console.error("Get active orders error:", error)
      return { orders: [] }
    }
  }

  // Cancel order
  static async cancelOrder(orderId) {
    try {
      const response = await api.delete(`/trade/orders/${orderId}`)
      return response.data
    } catch (error) {
      console.error("Cancel order error:", error)
      throw error
    }
  }

  // Get trading recommendations
  static async getTradingRecommendations() {
    try {
      const response = await api.get("/trade/recommendations")
      return response.data
    } catch (error) {
      console.error("Get trading recommendations error:", error)
      return { recommendations: [] }
    }
  }

  // Get trading statistics
  static async getTradingStatistics(period = "month") {
    try {
      const response = await api.get(`/trade/statistics?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Get trading statistics error:", error)
      return { statistics: {} }
    }
  }
}

export default TradeService
