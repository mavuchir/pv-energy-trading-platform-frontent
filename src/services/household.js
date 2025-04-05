import api from "./api"

const HouseholdService = {
  // Get household configuration
  getHouseholdConfiguration: async () => {
    try {
      const response = await api.get("/household/configuration")
      return response.data
    } catch (error) {
      console.error("Error fetching household configuration:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch household configuration",
      }
    }
  },

  // Update household configuration
  updateHouseholdConfiguration: async (config) => {
    try {
      const response = await api.put("/household/configuration", config)
      return response.data
    } catch (error) {
      console.error("Error updating household configuration:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to update household configuration",
      }
    }
  },

  // Get household data
  getHouseholdData: async () => {
    try {
      const response = await api.get("/household/data")
      return response.data
    } catch (error) {
      console.error("Error fetching household data:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch household data",
      }
    }
  },

  // Update household profile
  updateHouseholdProfile: async (profile) => {
    try {
      const response = await api.put("/household/profile", profile)
      return response.data
    } catch (error) {
      console.error("Error updating household profile:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to update household profile",
      }
    }
  },
}

export default HouseholdService

