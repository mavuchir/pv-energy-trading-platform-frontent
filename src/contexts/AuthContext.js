"use client"

import { createContext, useContext, useState, useEffect } from "react"
import api from "../config/axios"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      console.log("Fetching current user data...")
      const response = await api.get("/auth/me")
      console.log("User data received:", response.data)
      setUser(response.data)
      setIsConfigured(response.data.is_configured || false)
      setError(null)
    } catch (error) {
      console.error("Error fetching user:", error)

      // Check for CORS errors
      if (error.message && error.message.includes("Network Error")) {
        setError("Network error. This might be a CORS issue.")
      } else if (error.response?.status === 401) {
        localStorage.removeItem("token")
        setError("Session expired. Please login again.")
      } else {
        setError("Failed to load user data. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    setLoading(true)
    setError(null)
    try {
      console.log("Attempting login with username:", username)
      const response = await api.post("/auth/login", { username, password })
      console.log("Login response:", response.data)

      // Store the token and set it in axios defaults
      const token = response.data.token
      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setUser(response.data.user)
      setIsConfigured(response.data.user.is_configured || false)
      setSuccessMessage("Login successful!")
      return response.data.user
    } catch (error) {
      console.error("Login error:", error)

      // Check for CORS errors
      if (error.message && error.message.includes("Network Error")) {
        setError("Network error. This might be a CORS issue.")
      } else if (error.response?.data?.msg) {
        setError(error.response.data.msg)
      } else {
        setError("Login failed. Please try again.")
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      console.log("Sending registration data:", {
        ...userData,
        password: "[REDACTED]",
      })

      const response = await api.post("/auth/register", userData)
      console.log("Registration response:", response.status)

      setSuccessMessage("Registration successful!")
      return response.data
    } catch (error) {
      console.error("Registration error:", error)

      // Detailed error logging
      if (error.message) {
        console.error("Error message:", error.message)
      }
      if (error.response) {
        console.error("Response status:", error.response.status)
        console.error("Response data:", error.response.data)
      }

      // Check for CORS errors
      if (error.message && error.message.includes("Network Error")) {
        const errorMessage = "Network error. This might be a CORS issue."
        setError(errorMessage)
        throw new Error(errorMessage)
      } else {
        const errorMessage = error.response?.data?.msg || error.response?.data?.message || "Registration failed"
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
    setIsConfigured(false)
    setSuccessMessage("")
    setError(null)
  }

  const updateProfile = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.put("/auth/update-profile", userData)
      setUser(response.data.user)
      setSuccessMessage("Profile updated successfully!")
      return response.data.user
    } catch (error) {
      console.error("Profile update error:", error)

      // Check for CORS errors
      if (error.message && error.message.includes("Network Error")) {
        setError("Network error. This might be a CORS issue.")
      } else if (error.response && error.response.data && error.response.data.msg) {
        setError(error.response.data.msg)
      } else {
        setError("Profile update failed. Please try again.")
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const configureHousehold = async (configData) => {
    setLoading(true)
    setError(null)
    try {
      // Ensure token is set in headers
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.")
      }

      // Double-check that the token is in the headers
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      console.log("Sending configuration with token:", token.substring(0, 10) + "...")

      const response = await api.post("/household/configuration", configData)
      setIsConfigured(true)

      // Update user data if returned
      if (response.data.user) {
        setUser(response.data.user)
      }

      setSuccessMessage("Household configured successfully!")
      return response.data
    } catch (error) {
      console.error("Configuration error:", error)

      // Check for auth errors
      if (error.response?.status === 401) {
        setError("Authentication failed. Please log in again.")
        // Force logout on auth failure
        logout()
      } else if (error.message && error.message.includes("Network Error")) {
        setError("Network error. This might be a CORS issue.")
      } else if (error.response && error.response.data && error.response.data.msg) {
        setError(error.response.data.msg)
      } else {
        setError("Configuration failed. Please try again.")
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const clearMessages = () => {
    setError(null)
    setSuccessMessage("")
  }

  const value = {
    user,
    loading,
    error,
    successMessage,
    isConfigured,
    login,
    register,
    logout,
    updateProfile,
    configureHousehold,
    clearMessages,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider

