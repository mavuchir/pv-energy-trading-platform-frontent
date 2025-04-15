import api from "./api"

class ApplianceService {
  // Get all appliances
  static async getAppliances() {
    try {
      const response = await api.get("/appliance/list")
      return response.data.appliances || []
    } catch (error) {
      console.error("Get appliances error:", error)
      return []
    }
  }

  // Get appliance details
  static async getApplianceDetails(applianceId) {
    try {
      const response = await api.get(`/appliance/${applianceId}`)
      return response.data
    } catch (error) {
      console.error("Get appliance details error:", error)
      return null
    }
  }

  // Add new appliance
  static async addAppliance(applianceData) {
    try {
      const response = await api.post("/appliance/add", applianceData)
      return response.data
    } catch (error) {
      console.error("Add appliance error:", error)
      throw error
    }
  }

  // Update appliance
  static async updateAppliance(applianceId, applianceData) {
    try {
      const response = await api.put(`/appliance/${applianceId}`, applianceData)
      return response.data
    } catch (error) {
      console.error("Update appliance error:", error)
      throw error
    }
  }

  // Delete appliance
  static async deleteAppliance(applianceId) {
    try {
      const response = await api.delete(`/appliance/${applianceId}`)
      return response.data
    } catch (error) {
      console.error("Delete appliance error:", error)
      throw error
    }
  }

  // Toggle appliance status
  static async toggleAppliance(applianceId, status) {
    try {
      const response = await api.post(`/appliance/${applianceId}/toggle`, { status })
      return response.data
    } catch (error) {
      console.error("Toggle appliance error:", error)
      throw error
    }
  }

  // Get appliance usage history
  static async getApplianceUsage(applianceId, period = "day") {
    try {
      const response = await api.get(`/appliance/${applianceId}/usage?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Get appliance usage error:", error)
      return { usage: [] }
    }
  }

  // Schedule appliance
  static async scheduleAppliance(applianceId, scheduleData) {
    try {
      const response = await api.post(`/appliance/${applianceId}/schedule`, scheduleData)
      return response.data
    } catch (error) {
      console.error("Schedule appliance error:", error)
      throw error
    }
  }

  // Get appliance schedules
  static async getApplianceSchedules(applianceId) {
    try {
      const response = await api.get(`/appliance/${applianceId}/schedules`)
      return response.data
    } catch (error) {
      console.error("Get appliance schedules error:", error)
      return { schedules: [] }
    }
  }

  // Delete appliance schedule
  static async deleteApplianceSchedule(applianceId, scheduleId) {
    try {
      const response = await api.delete(`/appliance/${applianceId}/schedule/${scheduleId}`)
      return response.data
    } catch (error) {
      console.error("Delete appliance schedule error:", error)
      throw error
    }
  }
}

export default ApplianceService
