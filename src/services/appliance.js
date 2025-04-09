import api from "./api"

const ApplianceService = {
  // Get all appliances
  getAllAppliances: async () => {
    try {
      const response = await api.get("/appliance/all")
      return response.data
    } catch (error) {
      console.error("Error fetching appliances:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch appliances",
      }
    }
  },

  // Get appliances (alias for getAllAppliances for compatibility)
  getAppliances: async () => {
    try {
      const response = await api.get("/appliance/all")
      return response.data
    } catch (error) {
      console.error("Error fetching appliances:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch appliances",
      }
    }
  },

  // Add a new appliance
  addAppliance: async (applianceData) => {
    try {
      // Make sure we have the required fields
      if (!applianceData.name || !applianceData.power_consumption) {
        return {
          success: false,
          error: "Missing required appliance data",
        }
      }

      // Ensure we have the required fields
      const payload = {
        ...applianceData,
        is_smart: applianceData.is_smart || false,
        is_on: applianceData.is_on || false,
      }

      console.log("Adding appliance with data:", payload)
      const response = await api.post("/appliance/add", payload)
      return response.data
    } catch (error) {
      console.error("Error adding appliance:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to add appliance",
      }
    }
  },

  // Update an existing appliance
  updateAppliance: async (id, applianceData) => {
    try {
      const response = await api.put(`/appliance/${id}`, applianceData)
      return response.data
    } catch (error) {
      console.error("Error updating appliance:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to update appliance",
      }
    }
  },

  // Delete an appliance
  deleteAppliance: async (id) => {
    try {
      const response = await api.delete(`/appliance/${id}`)
      return response.data
    } catch (error) {
      console.error("Error deleting appliance:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to delete appliance",
      }
    }
  },

  // Toggle appliance on/off
  toggleAppliance: async (id, status) => {
    try {
      const response = await api.put(`/appliance/${id}/status`, { status })
      return response.data
    } catch (error) {
      console.error("Error toggling appliance:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to toggle appliance",
      }
    }
  },

  // Get appliance usage statistics
  getApplianceUsage: async (id, period = "day") => {
    try {
      const response = await api.get(`/appliance/${id}/usage?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Error fetching appliance usage:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch appliance usage",
      }
    }
  },

  // Get usage summary for all appliances
  getUsageSummary: async (period = "day") => {
    try {
      const response = await api.get(`/appliance/usage-summary?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Error fetching usage summary:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch usage summary",
      }
    }
  },

  // Clear all appliances
  clearAllAppliances: async () => {
    try {
      const response = await api.delete("/appliance/clear-all")
      return response.data
    } catch (error) {
      console.error("Error clearing appliances:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to clear appliances",
      }
    }
  },
}

export default ApplianceService
