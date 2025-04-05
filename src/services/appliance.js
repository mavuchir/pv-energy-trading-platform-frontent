import api from "./api"

const ApplianceService = {
  // Get all appliances
  getAppliances: async () => {
    try {
      const response = await api.get("/appliance/list")
      return { success: true, data: response.data.appliances }
    } catch (error) {
      console.error("Error fetching appliances:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch appliances" }
    }
  },

  // Get appliance usage summary
  getApplianceUsageSummary: async (period = "day") => {
    try {
      const response = await api.get(`/appliance/usage-summary?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching appliance usage summary:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch appliance usage summary" }
    }
  },

  // Add new appliance
  addAppliance: async (applianceData) => {
    try {
      const response = await api.post("/appliance/add", applianceData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error adding appliance:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to add appliance" }
    }
  },

  // Update appliance
  updateAppliance: async (id, applianceData) => {
    try {
      const response = await api.put(`/appliance/update/${id}`, applianceData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error updating appliance:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to update appliance" }
    }
  },

  // Delete appliance
  deleteAppliance: async (id) => {
    try {
      const response = await api.delete(`/appliance/delete/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error deleting appliance:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to delete appliance" }
    }
  },

  // Toggle appliance status
  toggleAppliance: async (id, status) => {
    try {
      const response = await api.post(`/appliance/toggle/${id}`, { status })
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error toggling appliance:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to toggle appliance" }
    }
  },

  // Get appliance usage history
  getApplianceUsageHistory: async (id, period = "day") => {
    try {
      const response = await api.get(`/appliance/usage-history/${id}?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching appliance usage history:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch appliance usage history" }
    }
  },
}

export default ApplianceService

