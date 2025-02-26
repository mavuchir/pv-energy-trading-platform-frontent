"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

// Configure axios defaults
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000"
axios.defaults.baseURL = API_URL

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)
  const [token, setToken] = useState(() => localStorage.getItem("token"))

  useEffect(() => {
    if (token) {
      fetchUser(token)
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async (authToken) => {
    try {
      const response = await axios.get("/auth/user", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      setUser(response.data)
      setIsConfigured(response.data.isConfigured)
    } catch (error) {
      console.error("Error fetching user:", error)
      // Clear invalid token
      if (error.response?.status === 401) {
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    setLoading(true)
    try {
      const response = await axios.post("/auth/login", { username, password })
      const newToken = response.data.access_token
      localStorage.setItem("token", newToken)
      setToken(newToken)
      setUser(response.data.user)
      setIsConfigured(response.data.user.isConfigured)
      setSuccessMessage("Login successful!")
      return response.data.user.role
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = error.response?.data?.message || "Login failed"
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const register = async (username, email, password) => {
    setLoading(true)
    try {
      const response = await axios.post("/auth/register", {
        username,
        email,
        password,
        role: "household",
      })

      const newToken = response.data.access_token
      localStorage.setItem("token", newToken)
      setToken(newToken)
      setUser(response.data.user)
      setIsConfigured(false)
      setSuccessMessage("Registration successful!")

      return response.data.user
    } catch (error) {
      console.error("Registration error:", error)
      const errorMessage = error.response?.data?.message || "Registration failed"
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    setIsConfigured(false)
    setSuccessMessage("")
  }

  const setConfiguration = async (configData) => {
    try {
      const response = await axios.post("/api/household/configuration", configData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setIsConfigured(true)
      setUser((prevUser) => ({ ...prevUser, isConfigured: true }))
      return response.data
    } catch (error) {
      console.error("Configuration error:", error)
      const errorMessage = error.response?.data?.message || "Configuration failed"
      throw new Error(errorMessage)
    }
  }

  // Add refresh token functionality if needed
  const refreshToken = async () => {
    try {
      const response = await axios.post(
        "/auth/refresh",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const newToken = response.data.access_token
      localStorage.setItem("token", newToken)
      setToken(newToken)
      return newToken
    } catch (error) {
      console.error("Token refresh error:", error)
      logout()
      throw new Error("Session expired. Please login again.")
    }
  }

  const value = {
    user,
    loading,
    successMessage,
    isConfigured,
    token,
    login,
    register,
    logout,
    setConfiguration,
    setUser,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

