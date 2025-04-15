import api from "./api"

class AnalyticsService {
  // Get energy analytics
  static async getEnergyAnalytics(period = "month") {
    try {
      const response = await api.get(`/analytics/energy?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Get energy analytics error:", error)
      return { data: {} }
    }
  }

  // Get consumption patterns
  static async getConsumptionPatterns(period = "month") {
    try {
      const response = await api.get(`/analytics/consumption-patterns?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Get consumption patterns error:", error)
      return { patterns: [] }
    }
  }

  // Get production patterns
  static async getProductionPatterns(period = "month") {
    try {
      const response = await api.get(`/analytics/production-patterns?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Get production patterns error:", error)
      return { patterns: [] }
    }
  }

  // Get appliance usage analytics
  static async getApplianceAnalytics(period = "month") {
    try {
      const response = await api.get(`/analytics/appliances?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Get appliance analytics error:", error)
      return { appliances: [] }
    }
  }

  // Get trading analytics
  static async getTradingAnalytics(period = "month") {
    try {
      const response = await api.get(`/analytics/trading?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Get trading analytics error:", error)
      return { trading: {} }
    }
  }

  // Get cost savings analytics
  static async getCostSavingsAnalytics(period = "month") {
    try {
      const response = await api.get(`/analytics/cost-savings?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Get cost savings analytics error:", error)
      return { savings: 0, comparison: {} }
    }
  }

  // Get carbon footprint analytics
  static async getCarbonFootprintAnalytics(period = "month") {
    try {
      const response = await api.get(`/analytics/carbon-footprint?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Get carbon footprint analytics error:", error)
      return { footprint: 0, comparison: {} }
    }
  }

  // Get energy efficiency recommendations
  static async getEfficiencyRecommendations() {
    try {
      const response = await api.get("/analytics/efficiency-recommendations")
      return response.data
    } catch (error) {
      console.error("Get efficiency recommendations error:", error)
      return { recommendations: [] }
    }
  }

  // Get custom analytics report
  static async getCustomReport(params) {
    try {
      const response = await api.post("/analytics/custom-report", params)
      return response.data
    } catch (error) {
      console.error("Get custom report error:", error)
      throw error
    }
  }

  // Export analytics data
  static async exportAnalyticsData(format = "csv", params = {}) {
    try {
      const response = await api.post(`/analytics/export?format=${format}`, params, {
        responseType: "blob",
      })
      return response.data
    } catch (error) {
      console.error("Export analytics data error:", error)
      throw error
    }
  }
}

export default AnalyticsService
