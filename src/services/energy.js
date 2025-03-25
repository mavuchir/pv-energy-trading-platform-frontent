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
   * @returns {Promise<{success: boolean, data: Array, error: string}>}
   */
  getGenerationData: async (period = "day") => {
    try {
      const response = await api.get(`/energy/generation?period=${period}`)
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
   * @returns {Promise<{success: boolean, data: Array, error: string}>}
   */
  getConsumptionData: async (period = "day") => {
    try {
      const response = await api.get(`/energy/consumption?period=${period}`)
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
   * Record energy consumption
   * @param {Object} data - The consumption data
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  recordConsumption: async (data) => {
    try {
      const response = await api.post("/energy/record", {
        type: "consumption",
        ...data,
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error recording consumption:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to record consumption",
      }
    }
  },

  /**
   * Get grid interaction data
   * @param {string} period - The time period (day, week, month)
   * @returns {Promise<{success: boolean, data: Array, error: string}>}
   */
  getGridData: async (period = "day") => {
    try {
      const response = await api.get(`/energy/grid?period=${period}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching grid data:", error)
      return {
        success: false,
        data: [],
        error: error.response?.data?.msg || "Failed to fetch grid data",
      }
    }
  },
}

export default EnergyService

