import api from "./api"

const energyService = {
  // Dashboard data
  getDashboardData: async () => {
    try {
      const response = await api.get("/energy/dashboard")
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch dashboard data",
      }
    }
  },

  // Battery status
  getBatteryStatus: async () => {
    try {
      const response = await api.get("/energy/battery?latest=true")
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching battery status:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch battery status",
      }
    }
  },

  getBatteryHistory: async (startDate, endDate) => {
    try {
      let url = "/energy/battery"
      if (startDate || endDate) {
        url += "?"
        if (startDate) url += `start_date=${startDate.toISOString()}`
        if (endDate) url += `${startDate ? "&" : ""}end_date=${endDate.toISOString()}`
      }

      const response = await api.get(url)
      return { success: true, data: response.data.statuses || [] }
    } catch (error) {
      console.error("Error fetching battery history:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch battery history",
      }
    }
  },

  updateBatteryStatus: async (data) => {
    try {
      const response = await api.post("/energy/battery", data)
      return { success: true, data: response.data.status }
    } catch (error) {
      console.error("Error updating battery status:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to update battery status",
      }
    }
  },

  // Energy production
  getEnergyProduction: async (startDate, endDate, source, includeForecasted = false) => {
    try {
      let url = "/energy/production?"
      if (startDate) url += `start_date=${startDate.toISOString()}&`
      if (endDate) url += `end_date=${endDate.toISOString()}&`
      if (source) url += `source=${source}&`
      url += `include_forecasted=${includeForecasted}`

      const response = await api.get(url)
      return { success: true, data: response.data.productions || [] }
    } catch (error) {
      console.error("Error fetching energy production:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch energy production",
      }
    }
  },

  recordEnergyProduction: async (data) => {
    try {
      const response = await api.post("/energy/production", data)
      return { success: true, data: response.data.production }
    } catch (error) {
      console.error("Error recording energy production:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to record energy production",
      }
    }
  },

  // Energy consumption
  getEnergyConsumption: async (startDate, endDate, applianceId, includeForecasted = false) => {
    try {
      let url = "/energy/consumption?"
      if (startDate) url += `start_date=${startDate.toISOString()}&`
      if (endDate) url += `end_date=${endDate.toISOString()}&`
      if (applianceId) url += `appliance_id=${applianceId}&`
      url += `include_forecasted=${includeForecasted}`

      const response = await api.get(url)
      return { success: true, data: response.data.consumptions || [] }
    } catch (error) {
      console.error("Error fetching energy consumption:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch energy consumption",
      }
    }
  },

  recordEnergyConsumption: async (data) => {
    try {
      const response = await api.post("/energy/consumption", data)
      return { success: true, data: response.data.consumption }
    } catch (error) {
      console.error("Error recording energy consumption:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to record energy consumption",
      }
    }
  },

  // Predictions
  getDemandPrediction: async (hours = 24) => {
    try {
      const response = await api.get(`/ml/predict/demand?hours=${hours}`)
      return { success: true, predictions: response.data.predictions || [] }
    } catch (error) {
      console.error("Error fetching demand prediction:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch demand prediction",
      }
    }
  },

  getProductionPrediction: async (hours = 24) => {
    try {
      const response = await api.get(`/ml/predict/production?hours=${hours}`)
      return { success: true, predictions: response.data.predictions || [] }
    } catch (error) {
      console.error("Error fetching production prediction:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch production prediction",
      }
    }
  },

  getEnergyBalance: async (hours = 24) => {
    try {
      const response = await api.get(`/ml/balance?hours=${hours}`)
      return { success: true, balance: response.data.balance || [] }
    } catch (error) {
      console.error("Error fetching energy balance:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch energy balance",
      }
    }
  },

  getRecommendations: async () => {
    try {
      const response = await api.get("/ml/recommendations")
      return { success: true, recommendations: response.data.recommendations || [] }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch recommendations",
      }
    }
  },

  // Training ML models
  trainDemandModel: async (days = 30) => {
    try {
      const response = await api.post("/ml/train/demand", { days })
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error training demand model:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to train demand model",
      }
    }
  },

  trainProductionModel: async (days = 30) => {
    try {
      const response = await api.post("/ml/train/production", { days })
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error training production model:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to train production model",
      }
    }
  },
}

export default energyService
