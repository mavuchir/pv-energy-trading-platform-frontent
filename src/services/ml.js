import api from "./api"

const MLService = {
  // Get demand prediction
  getDemandPrediction: async (hours = 24) => {
    try {
      const response = await api.get(`/ml/predict?hours=${hours}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching demand prediction:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch demand prediction" }
    }
  },

  // Get community demand prediction
  getCommunityDemandPrediction: async (communityId, hours = 24) => {
    try {
      const response = await api.get(`/ml/community-predict/${communityId}?hours=${hours}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching community demand prediction:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch community demand prediction" }
    }
  },

  // Get energy optimization recommendations
  getEnergyOptimizationRecommendations: async () => {
    try {
      const response = await api.get("/ml/optimization-recommendations")
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching energy optimization recommendations:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch energy optimization recommendations",
      }
    }
  },

  // Get appliance usage patterns
  getApplianceUsagePatterns: async () => {
    try {
      const response = await api.get("/ml/appliance-patterns")
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching appliance usage patterns:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch appliance usage patterns" }
    }
  },
}

export default MLService

