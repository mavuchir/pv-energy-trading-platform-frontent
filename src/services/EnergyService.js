import api from "./api"

class EnergyService {
  // Get dashboard data
  static async getDashboardData() {
    try {
      const response = await api.get("/energy/dashboard")
      return response.data
    } catch (error) {
      console.error("Get dashboard data error:", error)
      // Return fallback data
      return {
        battery: { level: 0, capacity: 0 },
        today: { production: 0, consumption: 0, net: 0 },
        yesterday: { production: 0, consumption: 0, net: 0 },
        week: { production: 0, consumption: 0, net: 0 },
        month: { production: 0, consumption: 0, net: 0 },
        hourly: { production: [], consumption: [] },
        forecast: { production: [], consumption: [] },
      }
    }
  }

  // Get current battery status
  static async getCurrentStatus() {
    try {
      const response = await api.get("/energy/battery")
      return response.data
    } catch (error) {
      console.error("Get current status error:", error)
      return { status: "unknown", production: 0, consumption: 0 }
    }
  }

  // Get energy production data
  static async getProductionData(startDate, endDate, source) {
    try {
      let url = `/energy/production`
      if (startDate) url += `?start_date=${startDate}`
      if (endDate) url += `&end_date=${endDate}`
      if (source) url += `&source=${source}`

      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error("Get production data error:", error)
      return { productions: [], total: 0 }
    }
  }

  // Get energy consumption data
  static async getConsumptionData(startDate, endDate, applianceId) {
    try {
      let url = `/energy/consumption`
      if (startDate) url += `?start_date=${startDate}`
      if (endDate) url += `&end_date=${endDate}`
      if (applianceId) url += `&appliance_id=${applianceId}`

      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error("Get consumption data error:", error)
      return { consumptions: [], total: 0 }
    }
  }

  // Get battery status
  static async getBatteryStatus() {
    try {
      const response = await api.get("/energy/battery")
      return response.data
    } catch (error) {
      console.error("Get battery status error:", error)
      return { level: 0, capacity: 0, charging: false }
    }
  }

  // Update battery status
  static async updateBatteryStatus(status) {
    try {
      const response = await api.post("/energy/battery", status)
      return response.data
    } catch (error) {
      console.error("Update battery status error:", error)
      throw error
    }
  }

  // Get energy forecast for the next days
  static async getEnergyForecast(days = 7) {
    try {
      const response = await api.get(`/energy/forecast?days=${days}`)
      return response.data
    } catch (error) {
      console.error("Get energy forecast error:", error)
      return { forecast: [] }
    }
  }

  // Get grid connection status
  static async getGridStatus() {
    try {
      const response = await api.get("/energy/grid")
      return response.data
    } catch (error) {
      console.error("Get grid status error:", error)
      return { connected: false }
    }
  }

  // Toggle grid connection
  static async toggleGridConnection(isConnected) {
    try {
      const response = await api.put("/energy/grid", { connected: isConnected })
      return response.data
    } catch (error) {
      console.error("Toggle grid connection error:", error)
      throw error
    }
  }
}

export default EnergyService