"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  FaUser,
  FaLock,
  FaFingerprint,
  FaExclamationTriangle,
  FaEnvelope,
  FaIdCard,
  FaPhone,
  FaMapMarkerAlt,
  FaCheckCircle,
} from "react-icons/fa"
import { useAuth } from "../../contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"

const Login = () => {
  // Login state
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  // Register state
  const [email, setEmail] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")

  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")
  const [isLoginMode, setIsLoginMode] = useState(true)
  const { login, register, loading, error, successMessage, clearMessages } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (clearMessages) {
      clearMessages()
    }
    setFormError("")
    setFormSuccess("")
  }, [clearMessages, isLoginMode])

  const handleLogin = async (e) => {
    e.preventDefault()
    setFormError("")
    setFormSuccess("")

    try {
      // Use the login function from AuthContext
      const userData = await login(username, password)

      if (userData) {
        setFormSuccess("Login successful! Redirecting...")

        // Check if user has completed configuration
        const hasCompletedConfig = userData.is_configured || false

        // Redirect based on configuration status
        setTimeout(() => {
          navigate(hasCompletedConfig ? "/dashboard" : "/configuration")
        }, 1000)
      }
    } catch (err) {
      console.error("Login error:", err)
      const errorMessage = err.response?.data?.msg || err.message || "Login failed. Please try again."
      setFormError(errorMessage)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setFormError("")
    setFormSuccess("")

    if (password !== confirmPassword) {
      setFormError("Passwords don't match")
      return
    }

    try {
      // Create a user data object with all fields
      const userData = {
        username,
        email,
        password,
        full_name: fullName,
        phone,
        location,
        role: "household", // Default role
      }

      console.log("Submitting registration form with data:", {
        ...userData,
        password: "********", // Don't log the actual password
      })

      const response = await register(userData)
      console.log("Registration successful, response:", response)

      setFormSuccess("Registration successful! You can now log in.")

      // Clear registration fields and switch to login mode after a delay
      setTimeout(() => {
        setEmail("")
        setFullName("")
        setPhone("")
        setLocation("")
        setPassword("")
        setConfirmPassword("")
        setIsLoginMode(true)
      }, 2000)
    } catch (error) {
      console.error("Registration failed in component:", error)
      const errorMessage = error.response?.data?.msg || error.message || "Registration failed. Please try again."
      setFormError(errorMessage)
    }
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setFormError("")
    setFormSuccess("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-5xl w-full h-[650px] flex rounded-lg shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 flex">
          {/* Left Side - Login Form */}
          <div className="w-1/2 bg-white flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isLoginMode && (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-md p-8"
                >
                  <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Sign in to Account</h2>

                  {/* Error message */}
                  {(error || formError) && (
                    <div
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 flex items-start"
                      role="alert"
                    >
                      <FaExclamationTriangle className="h-5 w-5 mr-2 mt-0.5" />
                      <span className="block sm:inline">{formError || error}</span>
                    </div>
                  )}

                  {/* Success message */}
                  {(successMessage || formSuccess) && (
                    <div
                      className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 flex items-start"
                      role="alert"
                    >
                      <FaCheckCircle className="h-5 w-5 mr-2 mt-0.5" />
                      <span className="block sm:inline">{formSuccess || successMessage}</span>
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleLogin}>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Username"
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Link to="/forgot-password" className="text-sm text-teal-600 hover:underline">
                        Forgot your password?
                      </Link>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-70"
                    >
                      {loading ? "Signing in..." : "SIGN IN"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side - Register Form */}
          <div className="w-1/2 bg-white flex items-center justify-center">
            <AnimatePresence mode="wait">
              {!isLoginMode && (
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-md p-8 overflow-y-auto max-h-[650px]"
                >
                  <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Account</h2>

                  {/* Error message */}
                  {(error || formError) && (
                    <div
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 flex items-start"
                      role="alert"
                    >
                      <FaExclamationTriangle className="h-5 w-5 mr-2 mt-0.5" />
                      <span className="block sm:inline">{formError || error}</span>
                    </div>
                  )}

                  {/* Success message */}
                  {(successMessage || formSuccess) && (
                    <div
                      className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 flex items-start"
                      role="alert"
                    >
                      <FaCheckCircle className="h-5 w-5 mr-2 mt-0.5" />
                      <span className="block sm:inline">{formSuccess || successMessage}</span>
                    </div>
                  )}

                  <form className="space-y-4" onSubmit={handleRegister}>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Username"
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="relative">
                      <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Location (e.g., Harare)"
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-70"
                    >
                      {loading ? "Creating Account..." : "SIGN UP"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sliding Panel */}
          <motion.div
            className="absolute top-0 bottom-0 w-1/2 bg-teal-600 rounded-lg shadow-xl z-10 flex flex-col justify-center items-center p-12 text-white text-center"
            initial={{ right: isLoginMode ? "0%" : "50%" }}
            animate={{ right: isLoginMode ? "0%" : "50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <FaFingerprint className="h-12 w-12 mb-6" />
            <h2 className="text-3xl font-bold mb-6">{isLoginMode ? "New Here?" : "Welcome Back!"}</h2>
            <p className="mb-8 max-w-xs">
              {isLoginMode
                ? "Create an account to start trading energy and managing your household's power."
                : "To keep connected with us please login with your personal info."}
            </p>
            <button
              onClick={toggleMode}
              className="py-2 px-8 border-2 border-white text-white rounded-full hover:bg-white hover:text-teal-600 transition-colors duration-300 text-center font-medium"
            >
              {isLoginMode ? "SIGN UP" : "SIGN IN"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login

