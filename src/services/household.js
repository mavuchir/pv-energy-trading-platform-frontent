import api from "./api"

const HouseholdService = {
  // Get household configuration - Now gets user data from auth/me
  getHouseholdConfiguration: async () => {
    try {
      const response = await api.get("/auth/me")
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching household configuration:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch household configuration",
      }
    }
  },

  // Update household configuration - Now updates user profile
  updateHouseholdConfiguration: async (config) => {
    try {
      const response = await api.put("/auth/update-profile", config)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error updating household configuration:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to update household configuration",
      }
    }
  },

  // Create or update household configuration
  createOrUpdateHousehold: async (config) => {
    try {
      const response = await api.post("/household/configuration", config)
      return response.data
    } catch (error) {
      console.error("Error creating/updating household configuration:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to create/update household configuration",
      }
    }
  },

  // Get household data - Now gets user data from auth/me
  getHouseholdData: async () => {
    try {
      const response = await api.get("/auth/me")
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching household data:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch household data",
      }
    }
  },

  // Update household profile - Now updates user profile
  updateHouseholdProfile: async (profile) => {
    try {
      const response = await api.put("/auth/update-profile", profile)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error updating household profile:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to update household profile",
      }
    }
  },

  // Check if user has completed initial configuration
  hasCompletedConfiguration: async () => {
    try {
      const response = await api.get("/auth/me")
      return response.data.is_configured || false
    } catch (error) {
      console.error("Error checking configuration status:", error)
      return false
    }
  },

  // Get dashboard data
  getDashboardData: async (period = "day") => {
    try {
      const response = await api.get(`/household/dashboard?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch dashboard data",
      }
    }
  },

  // Get current energy status
  getCurrentStatus: async () => {
    try {
      const response = await api.get("/household/status")
      return response.data
    } catch (error) {
      console.error("Error fetching current status:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch current status",
      }
    }
  },

  // Simulate smart meter data (for testing)
  simulateSmartMeter: async (duration = 60, interval = 60) => {
    try {
      const response = await api.post("/household/simulate-smart-meter", {
        duration_minutes: duration,
        interval_seconds: interval,
      })
      return response.data
    } catch (error) {
      console.error("Error simulating smart meter:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to simulate smart meter data",
      }
    }
  },
}

export default HouseholdService

