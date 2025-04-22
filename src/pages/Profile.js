import React, { useState, useEffect } from "react"
import { useAuth } from "../hooks/use-auth"
import { FaUser, FaEnvelope, FaSolarPanel, FaBatteryFull, FaEdit, FaCheck, FaKey } from "react-icons/fa"

const Profile = () => {
  const { user, updateProfile, changePassword, clearMessages, error, successMessage } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [passwordMode, setPasswordMode] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    solar_capacity: "",
    battery_capacity: "",
  })
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})
  
  useEffect(() => {
    // Clear any previous messages
    clearMessages()
    
    // Initialize form with user data
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        solar_capacity: user.solar_capacity || "",
        battery_capacity: user.battery_capacity || "",
      })
    }
  }, [user, clearMessages])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData({ ...passwordData, [name]: value })
  }
  
  const validateForm = () => {
    const errors = {}
    if (!formData.email) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid"
    
    if (formData.solar_capacity && isNaN(Number(formData.solar_capacity)))
      errors.solar_capacity = "Must be a number"
      
    if (formData.battery_capacity && isNaN(Number(formData.battery_capacity)))
      errors.battery_capacity = "Must be a number"
      
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const validatePasswordForm = () => {
    const errors = {}
    if (!passwordData.current_password) errors.current_password = "Current password is required"
    if (!passwordData.new_password) errors.new_password = "New password is required"
    else if (passwordData.new_password.length < 8) errors.new_password = "Password must be at least 8 characters"
    if (!passwordData.confirm_password) errors.confirm_password = "Please confirm your password"
    else if (passwordData.new_password !== passwordData.confirm_password) 
      errors.confirm_password = "Passwords don't match"
      
    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      // Process numeric values
      const updatedData = {
        ...formData,
        solar_capacity: formData.solar_capacity ? Number(formData.solar_capacity) : undefined,
        battery_capacity: formData.battery_capacity ? Number(formData.battery_capacity) : undefined,
      }
      
      await updateProfile(updatedData)
      setEditMode(false)
    } catch (err) {
      console.error("Error updating profile:", err)
      // Error is handled by AuthContext
    }
  }
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) return
    
    try {
      await changePassword(passwordData.current_password, passwordData.new_password)
      // Reset form and exit password mode on success
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      })
      setPasswordMode(false)
    } catch (err) {
      console.error("Error changing password:", err)
      // Error is handled by AuthContext
    }
  }
  
  const cancelEdit = () => {
    // Reset form to original values
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        solar_capacity: user.solar_capacity || "",
        battery_capacity: user.battery_capacity || "",
      })
    }
    setFormErrors({})
    setEditMode(false)
  }
  
  const cancelPasswordChange = () => {
    setPasswordData({
      current_password: "",
      new_password: "",
      confirm_password: "",
    })
    setPasswordErrors({})
    setPasswordMode(false)
  }
  
  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Profile</h1>
      
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaCheck className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaKey className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-teal-400 text-white">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="flex-shrink-0 mb-4 sm:mb-0">
              <div className="h-24 w-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold">
                {user?.first_name ? user.first_name[0] : user?.username ? user.username[0] : "U"}
              </div>
            </div>
            <div className="ml-0 sm:ml-6 text-center sm:text-left">
              <h2 className="text-2xl font-bold">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : user?.username || "User"}
              </h2>
              <p className="text-blue-100">{user?.email}</p>
              <p className="mt-1 text-blue-100">
                Account created: {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString() 
                  : "Unknown"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Profile Information */}
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            {!editMode && !passwordMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center text-sm text-primary hover:text-primary-dark"
              >
                <FaEdit className="mr-1" /> Edit Profile
              </button>
            )}
          </div>
          
          {editMode ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 block w-full shadow-sm sm:text-sm ${
                      formErrors.email ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-primary focus:border-primary"
                    } rounded-md`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="solar_capacity" className="block text-sm font-medium text-gray-700">
                    Solar Capacity (kW)
                  </label>
                  <input
                    type="text"
                    name="solar_capacity"
                    id="solar_capacity"
                    value={formData.solar_capacity}
                    onChange={handleChange}
                    className={`mt-1 block w-full shadow-sm sm:text-sm ${
                      formErrors.solar_capacity ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-primary focus:border-primary"
                    } rounded-md`}
                  />
                  {formErrors.solar_capacity && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.solar_capacity}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="battery_capacity" className="block text-sm font-medium text-gray-700">
                    Battery Capacity (kWh)
                  </label>
                  <input
                    type="text"
                    name="battery_capacity"
                    id="battery_capacity"
                    value={formData.battery_capacity}
                    onChange={handleChange}
                    className={`mt-1 block w-full shadow-sm sm:text-sm ${
                      formErrors.battery_capacity ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-primary focus:border-primary"
                    } rounded-md`}
                  />
                  {formErrors.battery_capacity && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.battery_capacity}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : passwordMode ? (
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="current_password"
                    id="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className={`mt-1 block w-full shadow-sm sm:text-sm ${
                      passwordErrors.current_password ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-primary focus:border-primary"
                    } rounded-md`}
                  />
                  {passwordErrors.current_password && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.current_password}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="new_password"
                    id="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className={`mt-1 block w-full shadow-sm sm:text-sm ${
                      passwordErrors.new_password ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-primary focus:border-primary"
                    } rounded-md`}
                  />
                  {passwordErrors.new_password && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.new_password}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    id="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    className={`mt-1 block w-full shadow-sm sm:text-sm ${
                      passwordErrors.confirm_password ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-primary focus:border-primary"
                    } rounded-md`}
                  />
                  {passwordErrors.confirm_password && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirm_password}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelPasswordChange}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Change Password
                </button>
              </div>
            </form>
          ) : (
            <div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <FaUser className="mr-2 text-gray-400" /> First Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.first_name || "—"}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <FaUser className="mr-2 text-gray-400" /> Last Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.last_name || "—"}</dd>
                </div>
                
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <FaEnvelope className="mr-2 text-gray-400" /> Email Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <FaSolarPanel className="mr-2 text-gray-400" /> Solar Capacity
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user?.solar_capacity ? `${user.solar_capacity} kW` : "—"}
                  </dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <FaBatteryFull className="mr-2 text-gray-400" /> Battery Capacity
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user?.battery_capacity ? `${user.battery_capacity} kWh` : "—"}
                  </dd>
                </div>
              </dl>
              
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
                
                <button
                  onClick={() => setPasswordMode(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <FaKey className="mr-2 -ml-1 h-5 w-5 text-gray-500" />
                  Change Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Additional Account Information */}
      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Username</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.username}</dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Account Type</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user?.role === "admin" ? "Administrator" : "Standard User"}
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Last Login</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user?.last_login ? new Date(user.last_login).toLocaleString() : "Unknown"}
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Account Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default Profile
