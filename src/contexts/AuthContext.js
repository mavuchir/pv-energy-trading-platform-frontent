"use client"

import React, { createContext, useState, useEffect, useCallback } from "react"
import api from "../services/api"

// Create the auth context
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Clear error and success messages
  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  // Check if token exists and validate it
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token")

      if (token) {
        try {
          // Fetch user profile
          const response = await api.get("/auth/profile")
          setUser(response.data)
          setIsAuthenticated(true)
        } catch (err) {
          console.error("Auth validation error:", err)
          localStorage.removeItem("auth_token")
        }
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (username, password) => {
    clearMessages()
    setLoading(true)

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      })

      const { access_token, user } = response.data

      // Save token to localStorage
      localStorage.setItem("auth_token", access_token)

      setUser(user)
      setIsAuthenticated(true)
      setSuccessMessage("Login successful!")
      setLoading(false)

      return user
    } catch (err) {
      setLoading(false)
      const errorMessage = err.response?.data?.msg || "Login failed. Please check your credentials."
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Register function
  const register = async (userData) => {
    clearMessages()
    setLoading(true)

    try {
      const response = await api.post("/auth/register", userData)

      const { access_token, user } = response.data

      // Save token to localStorage
      localStorage.setItem("auth_token", access_token)

      setUser(user)
      setIsAuthenticated(true)
      setSuccessMessage("Registration successful!")
      setLoading(false)

      return user
    } catch (err) {
      setLoading(false)
      const errorMessage = err.response?.data?.msg || "Registration failed. Please try again."
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Logout function
  const logout = async () => {
    clearMessages()
    setLoading(true)

    try {
      // Call logout endpoint if available
      if (isAuthenticated) {
        await api.post("/auth/logout")
      }
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      // Remove token from localStorage
      localStorage.removeItem("auth_token")
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (profileData) => {
    clearMessages()
    setLoading(true)

    try {
      const response = await api.put("/auth/profile", profileData)

      setUser(response.data.user)
      setSuccessMessage("Profile updated successfully!")
      setLoading(false)

      return response.data.user
    } catch (err) {
      setLoading(false)
      const errorMessage = err.response?.data?.msg || "Failed to update profile. Please try again."
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    clearMessages()
    setLoading(true)

    try {
      await api.put("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      })

      setSuccessMessage("Password changed successfully!")
      setLoading(false)
    } catch (err) {
      setLoading(false)
      const errorMessage = err.response?.data?.msg || "Failed to change password. Please try again."
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Request password reset
  const requestPasswordReset = async (email) => {
    clearMessages()
    setLoading(true)

    try {
      await api.post("/auth/forgot-password", { email })

      setSuccessMessage("Password reset instructions have been sent to your email.")
      setLoading(false)
    } catch (err) {
      setLoading(false)
      const errorMessage = err.response?.data?.msg || "Failed to send password reset. Please try again."
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        successMessage,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        requestPasswordReset,
        clearMessages,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
