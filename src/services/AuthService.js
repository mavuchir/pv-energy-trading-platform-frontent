import api from "./api"

const authService = {
  login: async (username, password) => {
    try {
      console.log("Attempting login with:", { username })
      const response = await api.post("/auth/login", { username, password })
      console.log("Login API response:", response)

      if (response && response.access_token) {
        localStorage.setItem("token", response.access_token)
        api.setToken(response.access_token)

        return { success: true, user: response.user }
      } else {
        console.error("Invalid response format:", response)
        return {
          success: false,
          message: "Invalid response from server. Please try again.",
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please check your credentials.",
      }
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData)

      if (response && response.access_token) {
        localStorage.setItem("token", response.access_token)
        api.setToken(response.access_token)

        return { success: true, user: response.user }
      } else {
        return {
          success: false,
          message: "Registration failed. Please try again.",
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed. Please try again.",
      }
    }
  },

  logout: () => {
    localStorage.removeItem("token")
    api.removeToken()
    return { success: true }
  },

  getToken: () => {
    return localStorage.getItem("token")
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token")
  },

  getProfile: async () => {
    try {
      return await api.get("/auth/profile")
    } catch (error) {
      console.error("Get profile error:", error)
      throw error
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/auth/profile", profileData)
      return { success: true, user: response.user }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update profile.",
      }
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      await api.put("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to change password.",
      }
    }
  },
}

export default authService
