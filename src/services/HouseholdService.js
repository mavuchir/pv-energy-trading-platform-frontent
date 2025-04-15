import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

class HouseholdService {
  // Get household configuration
  async getHouseholdConfiguration() {
    try {
      const response = await axios.get(`${API_URL}/household/configuration`)
      return response.data
    } catch (error) {
      console.error("Get household configuration error:", error)
      throw error
    }
  }

  // Update household configuration
  async updateHouseholdConfiguration(configData) {
    try {
      const response = await axios.put(`${API_URL}/household/configuration`, configData)
      return response.data
    } catch (error) {
      console.error("Update household configuration error:", error)
      throw error
    }
  }

  // Check if household has completed configuration
  async hasCompletedConfiguration() {
    try {
      const response = await axios.get(`${API_URL}/household/configuration/status`)
      return response.data.is_configured
    } catch (error) {
      console.error("Check configuration status error:", error)
      return false
    }
  }

  // Get household energy profile
  async getEnergyProfile() {
    try {
      const response = await axios.get(`${API_URL}/household/profile`)
      return response.data
    } catch (error) {
      console.error("Get household energy profile error:", error)
      throw error
    }
  }

  // Get household members
  async getHouseholdMembers() {
    try {
      const response = await axios.get(`${API_URL}/household/members`)
      return response.data
    } catch (error) {
      console.error("Get household members error:", error)
      throw error
    }
  }

  // Add household member
  async addHouseholdMember(memberData) {
    try {
      const response = await axios.post(`${API_URL}/household/members`, memberData)
      return response.data
    } catch (error) {
      console.error("Add household member error:", error)
      throw error
    }
  }

  // Update household member
  async updateHouseholdMember(memberId, memberData) {
    try {
      const response = await axios.put(`${API_URL}/household/members/${memberId}`, memberData)
      return response.data
    } catch (error) {
      console.error(`Update household member ${memberId} error:`, error)
      throw error
    }
  }

  // Remove household member
  async removeHouseholdMember(memberId) {
    try {
      const response = await axios.delete(`${API_URL}/household/members/${memberId}`)
      return response.data
    } catch (error) {
      console.error(`Remove household member ${memberId} error:`, error)
      throw error
    }
  }

  // Get household energy usage statistics
  async getEnergyUsageStats(period = "month") {
    try {
      const response = await axios.get(`${API_URL}/household/stats?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Get household energy usage stats error:", error)
      throw error
    }
  }

  // Get household notifications
  async getNotifications() {
    try {
      const response = await axios.get(`${API_URL}/household/notifications`)
      return response.data
    } catch (error) {
      console.error("Get household notifications error:", error)
      throw error
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await axios.put(`${API_URL}/household/notifications/${notificationId}/read`)
      return response.data
    } catch (error) {
      console.error(`Mark notification ${notificationId} as read error:`, error)
      throw error
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences) {
    try {
      const response = await axios.put(`${API_URL}/household/notifications/preferences`, preferences)
      return response.data
    } catch (error) {
      console.error("Update notification preferences error:", error)
      throw error
    }
  }
}

export default new HouseholdService()
