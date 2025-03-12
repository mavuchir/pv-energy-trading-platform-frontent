"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import { useAuth } from "../contexts/AuthContext"
import api from "../config/axios"
import { FaExclamationTriangle, FaUser, FaSolarPanel } from "react-icons/fa"

const Settings = () => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [profileSettings, setProfileSettings] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
  })

  const [systemSettings, setSystemSettings] = useState({
    solar_capacity: 0,
    panel_efficiency: 0.85,
    battery_capacity: 0,
    battery_efficiency: 0.9,
    grid_connection: true,
    latitude: 0,
    longitude: 0,
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    energy_alerts: true,
    price_alerts: true,
    system_updates: true,
  })

  useEffect(() => {
    if (user) {
      // Initialize form with user data
      setProfileSettings({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
      })

      setSystemSettings({
        solar_capacity: user.solar_capacity || 0,
        panel_efficiency: user.panel_efficiency || 0.85,
        battery_capacity: user.battery_capacity || 0,
        battery_efficiency: user.battery_efficiency || 0.9,
        grid_connection: user.grid_connection !== undefined ? user.grid_connection : true,
        latitude: user.latitude || 0,
        longitude: user.longitude || 0,
      })

      // Fetch notification settings
      fetchNotificationSettings()
    }
  }, [user])

  const fetchNotificationSettings = async () => {
    try {
      // Since there's no dedicated endpoint, get user preferences from user data
      const response = await api.get("/household/configuration")
      // Set default notification settings if none exist
      setNotificationSettings({
        email_notifications: response.data.email_notifications ?? true,
        energy_alerts: response.data.energy_alerts ?? true,
        price_alerts: response.data.price_alerts ?? true,
        system_updates: response.data.system_updates ?? true,
      })
    } catch (err) {
      console.error("Error fetching notification settings:", err)
      // Keep default settings if fetch fails
      setNotificationSettings({
        email_notifications: true,
        energy_alerts: true,
        price_alerts: true,
        system_updates: true,
      })
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.put("/auth/update-profile", profileSettings)
      updateUser(response.data)
      setSuccess("Profile updated successfully")
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err.response?.data?.msg || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSystemUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.put("/household/configuration", systemSettings)
      updateUser(response.data.user)
      setSuccess("System settings updated successfully")
    } catch (err) {
      console.error("Error updating system settings:", err)
      setError(err.response?.data?.msg || "Failed to update system settings")
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Update notification settings as part of user configuration
      await api.post("/household/configuration", {
        ...systemSettings,
        email_notifications: notificationSettings.email_notifications,
        energy_alerts: notificationSettings.energy_alerts,
        price_alerts: notificationSettings.price_alerts,
        system_updates: notificationSettings.system_updates,
      })
      setSuccess("Notification settings updated successfully")
    } catch (err) {
      console.error("Error updating notification settings:", err)
      setError(err.response?.data?.msg || "Failed to update notification settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

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
              <p>{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="system">System Configuration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaUser className="mr-2" />
                Profile Settings
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileSettings.full_name}
                    onChange={(e) => setProfileSettings({ ...profileSettings, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileSettings.phone}
                    onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileSettings.location}
                    onChange={(e) => setProfileSettings({ ...profileSettings, location: e.target.value })}
                    placeholder="Enter your location"
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaSolarPanel className="mr-2" />
                System Configuration
              </CardTitle>
              <CardDescription>Update your energy system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSystemUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="solar_capacity">Solar Capacity (kW)</Label>
                    <Input
                      id="solar_capacity"
                      type="number"
                      step="0.1"
                      value={systemSettings.solar_capacity}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, solar_capacity: Number.parseFloat(e.target.value) })
                      }
                      placeholder="Enter solar capacity"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="panel_efficiency">Panel Efficiency (0-1)</Label>
                    <Input
                      id="panel_efficiency"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={systemSettings.panel_efficiency}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, panel_efficiency: Number.parseFloat(e.target.value) })
                      }
                      placeholder="Enter panel efficiency"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="battery_capacity">Battery Capacity (kWh)</Label>
                    <Input
                      id="battery_capacity"
                      type="number"
                      step="0.1"
                      value={systemSettings.battery_capacity}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, battery_capacity: Number.parseFloat(e.target.value) })
                      }
                      placeholder="Enter battery capacity"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="battery_efficiency">Battery Efficiency (0-1)</Label>
                    <Input
                      id="battery_efficiency"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={systemSettings.battery_efficiency}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, battery_efficiency: Number.parseFloat(e.target.value) })
                      }
                      placeholder="Enter battery efficiency"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      value={systemSettings.latitude}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, latitude: Number.parseFloat(e.target.value) })
                      }
                      placeholder="Enter latitude"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      value={systemSettings.longitude}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, longitude: Number.parseFloat(e.target.value) })
                      }
                      placeholder="Enter longitude"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="grid_connection"
                    checked={systemSettings.grid_connection}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, grid_connection: checked })}
                  />
                  <Label htmlFor="grid_connection">Grid Connection</Label>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update System Configuration"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationUpdate} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email_notifications"
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, email_notifications: checked })
                    }
                  />
                  <Label htmlFor="email_notifications">Email Notifications</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="energy_alerts"
                    checked={notificationSettings.energy_alerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, energy_alerts: checked })
                    }
                  />
                  <Label htmlFor="energy_alerts">Energy Alerts</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="price_alerts"
                    checked={notificationSettings.price_alerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, price_alerts: checked })
                    }
                  />
                  <Label htmlFor="price_alerts">Price Alerts</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="system_updates"
                    checked={notificationSettings.system_updates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, system_updates: checked })
                    }
                  />
                  <Label htmlFor="system_updates">System Updates</Label>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Notification Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings

