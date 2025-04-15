import axios from "axios"

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

class AuthService {
  // Login user
  static async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      })

      const { access_token, user } = response.data

      // Save token to localStorage
      localStorage.setItem("auth_token", access_token)

      // Set authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`

      return user
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  // Register user
  static async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData)

      const { access_token, user } = response.data

      // Save token to localStorage
      localStorage.setItem("auth_token", access_token)

      // Set authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`

      return user
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  // Logout user
  static async logout() {
    try {
      // Call logout endpoint if available
      await axios.post(`${API_URL}/auth/logout`)
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Remove token from localStorage
      localStorage.removeItem("auth_token")

      // Remove authorization header
      delete axios.defaults.headers.common["Authorization"]
    }
  }

  // Get user profile
  static async getProfile() {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`)
      return response.data
    } catch (error) {
      console.error("Get profile error:", error)
      throw error
    }
  }

  // Update user profile
  static async updateProfile(profileData) {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, profileData)
      return response.data
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }

  // Change password
  static async changePassword(currentPassword, newPassword) {
    try {
      const response = await axios.put(`${API_URL}/auth/change-password`, {
        current_password: currentPassword,
        new_password: newPassword,
      })
      return response.data
    } catch (error) {
      console.error("Change password error:", error)
      throw error
    }
  }

  // Request password reset
  static async requestPasswordReset(email) {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email })
      return response.data
    } catch (error) {
      console.error("Request password reset error:", error)
      throw error
    }
  }

  // Reset password with token
  static async resetPassword(token, newPassword) {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        new_password: newPassword,
      })
      return response.data
    } catch (error) {
      console.error("Reset password error:", error)
      throw error
    }
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return !!localStorage.getItem("auth_token")
  }
}

export default AuthService
