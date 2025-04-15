import api from "./api"

const ApplianceService = {
  // Get all appliances
  getAllAppliances: async () => {
    try {
      const response = await api.get("/appliance/list")
      return {
        success: true,
        appliances: response.data?.appliances || [],
      }
    } catch (error) {
      console.error("Error fetching appliances:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch appliances",
        appliances: [],
      }
    }
  },

  // Get appliances (alias for getAllAppliances for compatibility)
  getAppliances: async () => {
    return ApplianceService.getAllAppliances()
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

      const response = await api.post("/appliance/add", payload)
      return {
        success: true,
        msg: "Appliance added successfully",
        appliance: response.data?.appliance,
      }
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
      return {
        success: true,
        msg: "Appliance updated successfully",
        appliance: response.data?.appliance,
      }
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
      return {
        success: true,
        msg: "Appliance deleted successfully",
      }
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
      return {
        success: true,
        msg: `Appliance ${status ? "turned on" : "turned off"} successfully`,
        appliance: response.data?.appliance,
      }
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
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching appliance usage:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch appliance usage",
        data: {},
      }
    }
  },

  // Fix the getUsageSummary method to handle the response correctly
  getUsageSummary: async (period = "day") => {
    try {
      const response = await api.get(`/appliance/usage-summary?period=${period}`)
      return {
        success: true,
        data: response.data,
        appliances: response.data?.appliances || [],
        total_energy_consumed: response.data?.total_energy_consumed || 0,
      }
    } catch (error) {
      console.error("Error fetching usage summary:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch usage summary",
        data: {},
        appliances: [],
        total_energy_consumed: 0,
      }
    }
  },

  // Clear all appliances
  clearAllAppliances: async () => {
    try {
      const response = await api.delete("/appliance/clear-all")
      return {
        success: true,
        msg: "All appliances cleared successfully",
        count: response.data?.count || 0,
      }
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
