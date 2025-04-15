import api from "./api"

class AdminService {
  // Get admin dashboard data
  async getAdminDashboardData() {
    try {
      const response = await api.get("/admin/dashboard")
      return response.data
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error)
      return {
        users: { total: 0, active: 0, new: 0 },
        communities: { total: 0 },
        system: { status: "unknown" },
        market: { current_price: 0 },
      }
    }
  }

  // Get system settings
  async getSystemSettings() {
    try {
      const response = await api.get("/admin/settings")
      return response.data
    } catch (error) {
      console.error("Error fetching system settings:", error)
      return { settings: {} }
    }
  }

  // Update system settings
  async updateSystemSettings(settings) {
    try {
      const response = await api.put("/admin/settings", settings)
      return response.data
    } catch (error) {
      console.error("Error updating system settings:", error)
      throw error
    }
  }

  // Get user list
  async getUsers(params = {}) {
    try {
      const response = await api.get("/admin/users", { params })
      return response.data
    } catch (error) {
      console.error("Error fetching users:", error)
      return { users: [] }
    }
  }

  // Get user details
  async getUserDetails(userId) {
    try {
      const response = await api.get(`/admin/users/${userId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching user details:", error)
      return null
    }
  }

  // Create user
  async createUser(userData) {
    try {
      const response = await api.post("/admin/users", userData)
      return response.data
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData)
      return response.data
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`)
      return response.data
    } catch (error) {
      console.error("Error deleting user:", error)
      throw error
    }
  }

  // Get communities
  async getCommunities() {
    try {
      const response = await api.get("/admin/communities")
      return response.data
    } catch (error) {
      console.error("Error fetching communities:", error)
      return { communities: [] }
    }
  }

  // Get audit logs
  async getAuditLogs(params = {}) {
    try {
      const response = await api.get("/admin/audit-logs", { params })
      return response.data
    } catch (error) {
      console.error("Error fetching audit logs:", error)
      return { logs: [] }
    }
  }

  // Update market price
  async updateMarketPrice(price) {
    try {
      const response = await api.post("/admin/market/price", { price })
      return response.data
    } catch (error) {
      console.error("Error updating market price:", error)
      throw error
    }
  }

  // Get system health
  async getSystemHealth() {
    try {
      const response = await api.get("/admin/system/health")
      return response.data
    } catch (error) {
      console.error("Error fetching system health:", error)
      return { status: "unknown", metrics: {} }
    }
  }
}

export default new AdminService()
