"use client"

import { useState, useEffect } from "react"
import { FaUser, FaEnvelope, FaLock, FaHome, FaSave, FaExclamationTriangle } from "react-icons/fa"
import { useAuth } from "../contexts/AuthContext"
import AuthService from "../services/AuthService"

const ProfileSettings = () => {
  const { user, updateUserProfile } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("personal")

  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const updatedUserData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      }

      const response = await AuthService.updateProfile(updatedUserData)
      updateUserProfile(response.data)
      setSuccess("Profile information updated successfully")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile information. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("New passwords do not match")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await AuthService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      setSuccess("Password changed successfully")
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }))
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error changing password:", err)
      setError("Failed to change password. Please check your current password and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-teal-600">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-red-600">
              <FaExclamationTriangle className="mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-green-600">
              <FaSave className="mr-2" />
              <p>{success}</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                activeTab === "personal"
                  ? "text-teal-600 border-b-2 border-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("personal")}
            >
              Personal Information
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                activeTab === "security"
                  ? "text-teal-600 border-b-2 border-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("security")}
            >
              Security
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                activeTab === "address"
                  ? "text-teal-600 border-b-2 border-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("address")}
            >
              Address
            </button>
          </div>

          <div className="p-6">
            {activeTab === "personal" && (
              <form onSubmit={handlePersonalInfoSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-100"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                </div>

                <div className="mb-6">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "security" && (
              <form onSubmit={handlePasswordChange}>
                <div className="mb-6">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <FaLock className="mr-2" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "address" && (
              <form onSubmit={handlePersonalInfoSubmit}>
                <div className="mb-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaHome className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings
