import api from "../config/axios"

const EnergyService = {
  /**
   * Get energy overview data
   * @param {string} period - The time period (day, week, month)
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  getEnergyOverview: async (period = "day") => {
    try {
      const response = await api.get(`/energy/overview?period=${period}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching energy overview:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch energy overview",
      }
    }
  },

  /**
   * Get real-time energy data
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  getRealTimeData: async () => {
    try {
      const response = await api.get("/energy/real-time")
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching real-time data:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch real-time data",
      }
    }
  },

  /**
   * Get energy generation data
   * @param {string} period - The time period (day, week, month)
   * @param {string} interval - The data interval (hour, day)
   * @returns {Promise<{success: boolean, data: Array, error: string}>}
   */
  getGenerationData: async (period = "day", interval = "hour") => {
    try {
      const response = await api.get(`/energy/generation?period=${period}&interval=${interval}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching generation data:", error)
      return {
        success: false,
        data: [],
        error: error.response?.data?.msg || "Failed to fetch generation data",
      }
    }
  },

  /**
   * Get energy consumption data
   * @param {string} period - The time period (day, week, month)
   * @param {string} interval - The data interval (hour, day)
   * @param {boolean} byAppliance - Group by appliance
   * @returns {Promise<{success: boolean, data: Array, error: string}>}
   */
  getConsumptionData: async (period = "day", interval = "hour", byAppliance = false) => {
    try {
      const response = await api.get(
        `/energy/consumption?period=${period}&interval=${interval}&by_appliance=${byAppliance}`,
      )
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching consumption data:", error)
      return {
        success: false,
        data: [],
        error: error.response?.data?.msg || "Failed to fetch consumption data",
      }
    }
  },

  /**
   * Get battery data
   * @param {string} period - The time period (day, week, month)
   * @returns {Promise<{success: boolean, data: Array, error: string}>}
   */
  getBatteryData: async (period = "day") => {
    try {
      const response = await api.get(`/energy/battery?period=${period}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching battery data:", error)
      return {
        success: false,
        data: [],
        error: error.response?.data?.msg || "Failed to fetch battery data",
      }
    }
  },

  /**
   * Get grid interaction data
   * @param {string} period - The time period (day, week, month)
   * @param {string} direction - Filter by direction (import, export, all)
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  getGridData: async (period = "day", direction = "all") => {
    try {
      const response = await api.get(`/energy/grid?period=${period}&direction=${direction}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching grid data:", error)
      return {
        success: false,
        data: { records: [], summary: {} },
        error: error.response?.data?.msg || "Failed to fetch grid data",
      }
    }
  },

  /**
   * Record energy data
   * @param {Object} data - The energy data to record
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  recordEnergyData: async (data) => {
    try {
      const response = await api.post("/energy/record", data)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error recording energy data:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to record energy data",
      }
    }
  },

  /**
   * Get weather data
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  getWeatherData: async () => {
    try {
      const response = await api.get("/energy/weather")
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching weather data:", error)
      return {
        success: false,
        data: {},
        error: error.response?.data?.msg || "Failed to fetch weather data",
      }
    }
  },

  /**
   * Get market prices
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  getMarketPrices: async () => {
    try {
      const response = await api.get("/energy/market-prices")
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching market prices:", error)
      return {
        success: false,
        data: { current: {}, historical: [] },
        error: error.response?.data?.msg || "Failed to fetch market prices",
      }
    }
  },
}

export default EnergyService

