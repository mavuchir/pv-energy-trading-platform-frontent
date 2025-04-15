"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { FaEnvelope, FaExclamationTriangle, FaCheckCircle, FaArrowLeft } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthContext"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")
  const { requestPasswordReset, loading } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")
    setFormSuccess("")

    try {
      await requestPasswordReset(email)
      setFormSuccess("Password reset instructions have been sent to your email.")
      setEmail("")
    } catch (err) {
      console.error("Password reset error:", err)
      setFormError(err.message || "Failed to send password reset. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="mb-6">
            <Link to="/auth/login" className="text-teal-600 hover:text-teal-700 flex items-center">
              <FaArrowLeft className="mr-2" />
              Back to Login
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Reset Your Password</h2>

          {formError && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 flex items-start"
              role="alert"
            >
              <FaExclamationTriangle className="h-5 w-5 mr-2 mt-0.5" />
              <span className="block sm:inline">{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 flex items-start"
              role="alert"
            >
              <FaCheckCircle className="h-5 w-5 mr-2 mt-0.5" />
              <span className="block sm:inline">{formSuccess}</span>
            </div>
          )}

          <p className="text-gray-600 mb-6">
            Enter your email address below and we'll send you instructions to reset your password.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-70"
            >
              {loading ? "Sending..." : "Send Reset Instructions"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
