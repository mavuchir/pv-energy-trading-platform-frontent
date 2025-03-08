"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/Card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Alert } from "../ui/Alert"
import { useAuth } from "../contexts/AuthContext"
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock } from "react-icons/fa"

const ProfileSettings = () => {
  const { user, updateProfile, loading, error, successMessage, clearMessages } = useAuth()

  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
  })

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  const [passwordMatch, setPasswordMatch] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
      })
    }

    // Clear messages when component mounts
    clearMessages()
  }, [user, clearMessages])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))

    if (name === "new_password" || name === "confirm_password") {
      setPasswordMatch(
        name === "new_password"
          ? value === passwordData.confirm_password || passwordData.confirm_password === ""
          : value === passwordData.new_password,
      )
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(profileData)
    } catch (error) {
      console.error("Failed to update profile:", error)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMatch(false)
      return
    }

    try {
      await updateProfile({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      })

      // Clear password fields after successful update
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      })
    } catch (error) {
      console.error("Failed to update password:", error)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === "profile" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile Information
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === "password" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("password")}
        >
          Change Password
        </button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success" className="mb-4">
          {successMessage}
        </Alert>
      )}

      {activeTab === "profile" ? (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <form onSubmit={handleProfileSubmit}>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUser className="inline mr-2" />
                  Full Name
                </label>
                <Input
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleProfileChange}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaEnvelope className="inline mr-2" />
                  Email Address
                </label>
                <Input
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  placeholder="Your email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaPhone className="inline mr-2" />
                  Phone Number
                </label>
                <Input
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Location
                </label>
                <Input
                  name="location"
                  value={profileData.location}
                  onChange={handleProfileChange}
                  placeholder="City, Country"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <form onSubmit={handlePasswordSubmit}>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaLock className="inline mr-2" />
                  Current Password
                </label>
                <Input
                  name="current_password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaLock className="inline mr-2" />
                  New Password
                </label>
                <Input
                  name="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  required
                  className={!passwordMatch ? "border-red-500" : ""}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaLock className="inline mr-2" />
                  Confirm New Password
                </label>
                <Input
                  name="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  required
                  className={!passwordMatch ? "border-red-500" : ""}
                />
                {!passwordMatch && <p className="text-red-500 text-xs italic mt-1">Passwords do not match</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading || !passwordMatch || !passwordData.new_password}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  )
}

export default ProfileSettings

