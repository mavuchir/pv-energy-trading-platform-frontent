import api from "../config/axios"

const ApplianceService = {
  /**
   * Get all appliances for the current user
   * @returns {Promise<{success: boolean, data: Array, error: string}>}
   */
  getAppliances: async () => {
    try {
      const response = await api.get("/appliance/list")
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching appliances:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch appliances",
      }
    }
  },

  /**
   * Add a new appliance
   * @param {Object} applianceData - The appliance data
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  addAppliance: async (applianceData) => {
    try {
      const response = await api.post("/appliance/add", applianceData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error adding appliance:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to add appliance",
      }
    }
  },

  /**
   * Update an existing appliance
   * @param {number} id - The appliance ID
   * @param {Object} applianceData - The updated appliance data
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  updateAppliance: async (id, applianceData) => {
    try {
      const response = await api.put(`/appliance/update/${id}`, applianceData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error updating appliance:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to update appliance",
      }
    }
  },

  /**
   * Delete an appliance
   * @param {number} id - The appliance ID
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  deleteAppliance: async (id) => {
    try {
      const response = await api.delete(`/appliance/remove/${id}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error deleting appliance:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to delete appliance",
      }
    }
  },

  /**
   * Toggle an appliance on/off
   * @param {number} id - The appliance ID
   * @param {boolean} isOn - The new state
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  toggleAppliance: async (id, isOn) => {
    try {
      const response = await api.post(`/appliance/toggle/${id}`, { is_on: isOn })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error toggling appliance:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to toggle appliance",
      }
    }
  },

  /**
   * Get appliance usage summary
   * @param {string} period - The time period (day, week, month)
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  getUsageSummary: async (period = "day") => {
    try {
      const response = await api.get(`/appliance/usage-summary?period=${period}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error getting usage summary:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to get usage summary",
      }
    }
  },

  /**
   * Save appliances from configuration
   * @param {Array} appliances - Array of appliance objects
   * @returns {Promise<{success: boolean, data: Object, error: string}>}
   */
  saveAppliancesFromConfig: async (appliances) => {
    try {
      // First clear existing appliances
      await api.delete("/appliance/clear-all")

      // Then add each appliance
      const results = []
      const errors = []

      for (const appliance of appliances) {
        try {
          const response = await api.post("/appliance/add", appliance)
          results.push(response.data)
        } catch (err) {
          console.error("Error adding appliance during config:", err)
          errors.push({
            appliance: appliance.name,
            error: err.response?.data?.msg || "Failed to add appliance",
          })
        }
      }

      return {
        success: errors.length === 0,
        data: {
          added: results.length,
          failed: errors.length,
          errors: errors,
        },
        message:
          errors.length > 0
            ? `Added ${results.length} appliances, but ${errors.length} failed`
            : `Successfully added all ${results.length} appliances`,
      }
    } catch (error) {
      console.error("Error saving appliances from config:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to save appliances from configuration",
      }
    }
  },
}

export default ApplianceService

