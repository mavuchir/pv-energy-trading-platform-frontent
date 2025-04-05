import api from "./api"

const EnergyService = {
  // Dashboard data
  getEnergyOverview: async (period = "day") => {
    try {
      const response = await api.get(`/energy/overview?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching energy overview:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch energy overview" }
    }
  },

  // Real-time data
  getRealTimeData: async () => {
    try {
      const response = await api.get("/energy/real-time")
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching real-time data:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch real-time data" }
    }
  },

  // Generation data
  getGenerationData: async (period = "day") => {
    try {
      const response = await api.get(`/energy/generation?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching generation data:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch generation data" }
    }
  },

  // Consumption data
  getConsumptionData: async (period = "day") => {
    try {
      const response = await api.get(`/energy/consumption?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching consumption data:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch consumption data" }
    }
  },

  // Battery data
  getBatteryData: async (period = "day") => {
    try {
      const response = await api.get(`/energy/battery?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching battery data:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch battery data" }
    }
  },

  // Grid data
  getGridData: async (period = "day") => {
    try {
      const response = await api.get(`/energy/grid?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching grid data:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch grid data" }
    }
  },

  // Record energy data (for simulation)
  recordEnergyData: async (data) => {
    try {
      const response = await api.post("/energy/record", data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error recording energy data:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to record energy data" }
    }
  },

  // Get energy forecast
  getEnergyForecast: async () => {
    try {
      const response = await api.get("/energy/forecast")
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching energy forecast:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch energy forecast" }
    }
  },
}

export default EnergyService

