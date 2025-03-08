"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

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
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }

    // Add response interceptor for handling token expiration
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token expired or invalid
          logout()
        }
        return Promise.reject(error)
      },
    )
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchUser(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async (token) => {
    try {
      const response = await axios.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(response.data)
      setIsConfigured(response.data.is_configured || false)
      setError(null)
    } catch (error) {
      console.error("Error fetching user:", error)
      localStorage.removeItem("token")
      setError("Session expired. Please login again.")
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post("/auth/login", { username, password })
      localStorage.setItem("token", response.data.access_token)

      setUser(response.data.user)
      setIsConfigured(response.data.user.is_configured || false)
      setSuccessMessage("Login successful!")
      return response.data.user
    } catch (error) {
      console.error("Login error:", error)
      if (error.response?.data?.msg) {
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
    try {
      // Make sure role is set to household
      const data = {
        ...userData,
        role: "household",
      }

      const response = await axios.post("/auth/register", data)

      setSuccessMessage("Registration successful!")
      return response.data.user
    } catch (error) {
      console.error("Registration error:", error)
      const errorMessage = error.response?.data?.msg || error.response?.data?.message || "Registration failed"
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    setIsConfigured(false)
    setSuccessMessage("")
    setError(null)
  }

  const updateProfile = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.put("/auth/update", userData)
      setUser(response.data.user)
      setSuccessMessage("Profile updated successfully!")
      return response.data.user
    } catch (error) {
      console.error("Profile update error:", error)
      if (error.response && error.response.data && error.response.data.msg) {
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
      const response = await axios.post("/household/configuration", configData)
      setIsConfigured(true)
      setUser(response.data.user)
      setSuccessMessage("Household configured successfully!")
      return response.data
    } catch (error) {
      console.error("Configuration error:", error)
      if (error.response && error.response.data && error.response.data.msg) {
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
axios.defaults.baseURL = API_URL

