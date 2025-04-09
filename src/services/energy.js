import api from "./api"

const EnergyService = {
  // Get energy overview
  getEnergyOverview: async (period = "day") => {
    try {
      const response = await api.get(`/energy/overview?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching energy overview:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch energy overview" }
    }
  },

  // Get real-time energy data
  getRealTimeData: async () => {
    try {
      const response = await api.get("/energy/real-time")
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching real-time data:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch real-time data" }
    }
  },

  // Get generation data
  getGenerationData: async (period = "day") => {
    try {
      const response = await api.get(`/energy/generation?period=${period}`)
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error("Error fetching generation data:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch generation data", data: [] }
    }
  },

  // Get consumption data
  getConsumptionData: async (period = "day") => {
    try {
      const response = await api.get(`/energy/consumption?period=${period}`)
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error("Error fetching consumption data:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch consumption data", data: [] }
    }
  },

  // Get battery data
  getBatteryData: async (period = "day") => {
    try {
      const response = await api.get(`/energy/battery?period=${period}`)
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error("Error fetching battery data:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch battery data", data: [] }
    }
  },

  // Get grid data
  getGridData: async (period = "day") => {
    try {
      const response = await api.get(`/energy/grid?period=${period}`)
      // Ensure we return an array even if the API returns an object with records
      const gridData = response.data?.records || response.data || []
      return { success: true, data: gridData }
    } catch (error) {
      console.error("Error fetching grid data:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch grid data", data: [] }
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

  // Get weather data
  getWeatherData: async () => {
    try {
      const response = await api.get("/energy/weather")
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching weather data:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch weather data" }
    }
  },

  // Get market prices
  getMarketPrices: async () => {
    try {
      const response = await api.get("/energy/market-prices")
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching market prices:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch market prices" }
    }
  },
}

export default EnergyService
