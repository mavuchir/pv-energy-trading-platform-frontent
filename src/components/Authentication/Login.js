"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaUser, FaLock, FaFingerprint, FaExclamationTriangle } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../config/axios"

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState("")
  const { login, loading, error, successMessage, clearMessages } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Clear any previous messages when component mounts
    clearMessages()
  }, [clearMessages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")

    try {
      console.log("Attempting login with username:", username)

      // Use direct API call to avoid CORS issues
      const response = await api.post("/auth/login", {
        username,
        password,
      })

      console.log("Login response:", response.data)

      // Store token
      if (response.data.token) {
        localStorage.setItem("token", response.data.token)

        // Set auth header for future requests
        api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`

        // Redirect based on configuration status
        if (response.data.user && response.data.user.is_configured) {
          navigate("/dashboard")
        } else {
          navigate("/configuration")
        }
      } else {
        setFormError("Login successful but no token received")
      }
    } catch (err) {
      console.error("Login error:", err)

      // Extract error message
      const errorMessage = err.response?.data?.msg || err.message || "Login failed. Please try again."
      setFormError(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <FaFingerprint className="mx-auto h-12 w-12 text-teal-600" />
          <h2 className="mt-6 text-3xl font-bold text-teal-600">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access your account</p>
        </div>

        {(error || formError) && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-start"
            role="alert"
          >
            <FaExclamationTriangle className="h-5 w-5 mr-2 mt-0.5" />
            <span className="block sm:inline">{formError || error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-teal-600 hover:text-teal-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/register" className="font-medium text-teal-600 hover:text-teal-500">
            Sign up
          </Link>
        </div>

        <p className="mt-2 text-center text-sm">
          <Link to="/" className="text-teal-600 hover:underline">
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login

