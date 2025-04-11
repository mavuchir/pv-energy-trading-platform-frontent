"use client"

import { useState, useEffect } from "react"
import {
  FaCog,
  FaSolarPanel,
  FaBatteryFull,
  FaUser,
  FaHome,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaKey,
  FaShieldAlt,
  FaTrash,
} from "react-icons/fa"
import { useAuth } from "../contexts/AuthContext"
import HouseholdService from "../services/household"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog"

const Settings = () => {
  const { user, updateUser, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    latitude: "",
    longitude: "",
  })
  const [systemForm, setSystemForm] = useState({
    solar_capacity: 0,
    panel_efficiency: 0,
    battery_capacity: 0,
    battery_efficiency: 0,
    grid_connection: true,
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        latitude: user.latitude || "",
        longitude: user.longitude || "",
      })

      setSystemForm({
        solar_capacity: user.solar_capacity || 0,
        panel_efficiency: user.panel_efficiency || 0,
        battery_capacity: user.battery_capacity || 0,
        battery_efficiency: user.battery_efficiency || 0,
        grid_connection: user.grid_connection !== false,
      })
    }
  }, [user])

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm({
      ...profileForm,
      [name]: value,
    })
  }

  // Handle system form changes
  const handleSystemChange = (e) => {
    const { name, value, type, checked } = e.target
    setSystemForm({
      ...systemForm,
      [name]: type === "checkbox" ? checked : Number.parseFloat(value),
    })
  }

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    })
  }

  // Update profile
  const updateProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await HouseholdService.updateHouseholdProfile(profileForm)
      if (response.success) {
        setSuccess("Profile updated successfully")
        updateUser(response.data)
      } else {
        setError(response.error || "Failed to update profile")
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Update system configuration
  const updateSystem = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await HouseholdService.updateHouseholdConfiguration(systemForm)
      if (response.success) {
        setSuccess("System configuration updated successfully")
        updateUser(response.data)
      } else {
        setError(response.error || "Failed to update system configuration")
      }
    } catch (err) {
      console.error("Error updating system configuration:", err)
      setError("Failed to update system configuration. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Change password
  const changePassword = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validate passwords
      if (passwordForm.new_password !== passwordForm.confirm_password) {
        setError("New passwords do not match")
        setLoading(false)
        return
      }

      // Mock API call - replace with actual API call
      setTimeout(() => {
        setSuccess("Password changed successfully")
        setShowPasswordDialog(false)
        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_password: "",
        })
        setLoading(false)
      }, 1000)
    } catch (err) {
      console.error("Error changing password:", err)
      setError("Failed to change password. Please try again.")
      setLoading(false)
    }
  }

  // Delete account
  const deleteAccount = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock API call - replace with actual API call
      setTimeout(() => {
        setShowDeleteDialog(false)
        logout()
        window.location.href = "/login"
      }, 1000)
    } catch (err) {
      console.error("Error deleting account:", err)
      setError("Failed to delete account. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-600">Settings</h1>
          <p className="text-gray-600">Manage your account and system preferences</p>
        </div>
      </div>

      {error && (
        <Card className="bg-red-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <FaExclamationTriangle className="mr-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="bg-green-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center text-green-600">
              <FaCheckCircle className="mr-2" />
              <p>{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">
            <FaUser className="mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="system">
            <FaCog className="mr-2" /> System Configuration
          </TabsTrigger>
          <TabsTrigger value="security">
            <FaShieldAlt className="mr-2" /> Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={profileForm.full_name}
                      onChange={handleProfileChange}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      placeholder="your.email..example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="Your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={profileForm.location}
                      onChange={handleProfileChange}
                      placeholder="Your location"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      value={profileForm.latitude}
                      onChange={handleProfileChange}
                      placeholder="Latitude coordinates"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      value={profileForm.longitude}
                      onChange={handleProfileChange}
                      placeholder="Longitude coordinates"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={updateProfile} className="bg-teal-600 hover:bg-teal-700">
                    {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                    Save Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Configuration Tab */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Configure your energy system specifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FaSolarPanel className="mr-2 text-yellow-500" />
                      <Label htmlFor="solar_capacity">Solar Capacity (kW)</Label>
                    </div>
                    <Input
                      id="solar_capacity"
                      name="solar_capacity"
                      type="number"
                      value={systemForm.solar_capacity}
                      onChange={handleSystemChange}
                      placeholder="e.g. 5.0"
                      step="0.1"
                      min="0"
                    />
                    <p className="text-xs text-gray-500">Total capacity of your solar panels in kilowatts</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panel_efficiency">Panel Efficiency (%)</Label>
                    <Input
                      id="panel_efficiency"
                      name="panel_efficiency"
                      type="number"
                      value={systemForm.panel_efficiency}
                      onChange={handleSystemChange}
                      placeholder="e.g. 18.5"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500">Efficiency rating of your solar panels</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FaBatteryFull className="mr-2 text-green-500" />
                      <Label htmlFor="battery_capacity">Battery Capacity (kWh)</Label>
                    </div>
                    <Input
                      id="battery_capacity"
                      name="battery_capacity"
                      type="number"
                      value={systemForm.battery_capacity}
                      onChange={handleSystemChange}
                      placeholder="e.g. 10.0"
                      step="0.1"
                      min="0"
                    />
                    <p className="text-xs text-gray-500">Total capacity of your battery storage in kilowatt-hours</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="battery_efficiency">Battery Efficiency (%)</Label>
                    <Input
                      id="battery_efficiency"
                      name="battery_efficiency"
                      type="number"
                      value={systemForm.battery_efficiency}
                      onChange={handleSystemChange}
                      placeholder="e.g. 90.0"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500">Charge/discharge efficiency of your battery</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <FaHome className="mr-2 text-blue-500" />
                    <Label htmlFor="grid_connection">Grid Connection</Label>
                  </div>
                  <Switch
                    id="grid_connection"
                    checked={systemForm.grid_connection}
                    onCheckedChange={(checked) => setSystemForm({ ...systemForm, grid_connection: checked })}
                  />
                  <span className="text-sm text-gray-500">
                    {systemForm.grid_connection ? "Connected to grid" : "Off-grid system"}
                  </span>
                </div>

                <div className="flex justify-end">
                  <Button onClick={updateSystem} className="bg-teal-600 hover:bg-teal-700">
                    {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                    Save Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start">
                    <FaKey className="mt-1 mr-3 text-blue-500" />
                    <div>
                      <h3 className="font-medium">Password</h3>
                      <p className="text-sm text-gray-500">Change your account password</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start">
                    <FaTrash className="mt-1 mr-3 text-red-500" />
                    <div>
                      <h3 className="font-medium">Delete Account</h3>
                      <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                    </div>
                  </div>
                  <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and a new password.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                name="current_password"
                type="password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                name="new_password"
                type="password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={changePassword} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be
              permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteAccount}>
              {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Settings
