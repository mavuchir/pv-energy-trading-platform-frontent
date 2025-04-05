"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/Input"
import { Switch } from "../components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Slider } from "../components/ui/Slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import {
  FaExclamationTriangle,
  FaCog,
  FaSolarPanel,
  FaBatteryFull,
  FaUser,
  FaHome,
  FaShieldAlt,
  FaBell,
  FaExchangeAlt,
  FaSave,
  FaSync,
  FaCheck,
  FaLocationArrow,
} from "react-icons/fa"
import HouseholdService from "../services/household"

const Settings = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [configuration, setConfiguration] = useState(null)
  const [activeTab, setActiveTab] = useState("system")
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [locationInput, setLocationInput] = useState("")
  const { user, logout } = useAuth()

  const fetchConfiguration = async () => {
    try {
      setLoading(true)
      const response = await HouseholdService.getHouseholdConfiguration()

      if (response.success) {
        setConfiguration(response.data)
        setError(null)
      } else {
        setError(response.error || "Failed to fetch configuration")
      }
    } catch (err) {
      console.error("Error fetching configuration:", err)
      setError("Failed to fetch configuration. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfiguration()
  }, [])

  const handleUpdateConfiguration = async () => {
    try {
      setLoading(true)
      setSuccess(null)
      setError(null)

      const response = await HouseholdService.updateHouseholdConfiguration(configuration)

      if (response.success) {
        setSuccess("Configuration updated successfully")

        // If this is the first time configuration, redirect to dashboard
        if (window.location.search.includes("initial=true")) {
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 1500)
        }

        setError(null)
      } else {
        setError(response.error || "Failed to update configuration")
        setSuccess(null)
      }
    } catch (err) {
      console.error("Error updating configuration:", err)
      setError("Failed to update configuration. Please try again.")
      setSuccess(null)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateLocation = async () => {
    try {
      setLoading(true)
      // This would typically call an API to validate and update the location
      // For now, we'll just update the local state
      setConfiguration({
        ...configuration,
        location: locationInput,
      })
      setIsLocationDialogOpen(false)
      setSuccess("Location updated successfully")
    } catch (err) {
      console.error("Error updating location:", err)
      setError("Failed to update location. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setConfiguration({
      ...configuration,
      [name]: value,
    })
  }

  // Handle number input changes
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target
    setConfiguration({
      ...configuration,
      [name]: Number(value),
    })
  }

  // Handle boolean toggle changes
  const handleToggleChange = (name, checked) => {
    setConfiguration({
      ...configuration,
      [name]: checked,
    })
  }

  if (loading && !configuration) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  const defaultConfig = {
    solar_capacity: 5,
    battery_capacity: 10,
    location: "Unknown",
    grid_connection: true,
    smart_meter_enabled: true,
    export_limit: 5,
    price_per_kwh: 0.2,
    export_price: 0.1,
    panel_type: "monocrystalline",
    installation_date: "",
    orientation: "south",
    tilt: 30,
    battery_type: "lithium_ion",
    inverter_capacity: 5,
    min_soc: 10,
    max_soc: 90,
    home_size: 150,
    occupants: 2,
    trading_enabled: false,
    auto_trade: false,
    notification_email: user?.email || "",
    notification_preferences: {
      daily_summary: true,
      alerts: true,
      tips: true,
      billing: true,
    },
    theme: "light",
    display_units: "metric",
    default_view: "dashboard",
    chart_animations: true,
    language: "en",
    data_logging_interval: 5,
    data_retention: "12_months",
    api_access: false,
    debug_mode: false,
    system_timezone: "auto",
    two_factor_enabled: false,
  }

  // Add a function to handle profile updates
  const handleUpdateProfile = async () => {
    try {
      setLoading(true)
      setSuccess(null)
      setError(null)

      // This would typically call an API to update the user profile
      // For now, we'll just simulate success
      setTimeout(() => {
        setSuccess("Profile updated successfully")
        setLoading(false)
      }, 1000)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile. Please try again.")
      setLoading(false)
    }
  }

  // Add a function to handle password changes
  const handleChangePassword = async () => {
    try {
      setLoading(true)
      setSuccess(null)
      setError(null)

      // This would typically call an API to change the password
      // For now, we'll just simulate success
      setTimeout(() => {
        setSuccess("Password changed successfully")
        setLoading(false)
      }, 1000)
    } catch (err) {
      console.error("Error changing password:", err)
      setError("Failed to change password. Please try again.")
      setLoading(false)
    }
  }

  // Use configuration data if available, otherwise use default
  const config = configuration || defaultConfig

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-600">System Configuration</h1>
          <p className="text-gray-600">Configure your energy system settings</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button onClick={fetchConfiguration} variant="outline">
            <FaSync className="mr-2" />
            Refresh
          </Button>
          <Button onClick={handleUpdateConfiguration} className="bg-teal-600 hover:bg-teal-700" disabled={loading}>
            <FaSave className="mr-2" />
            Save Changes
          </Button>
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
              <FaCheck className="mr-2" />
              <p>{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {window.location.search.includes("initial=true") && (
        <Card className="bg-blue-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center text-blue-600">
              <FaUser className="mr-2" />
              <div>
                <p className="font-medium">Welcome to the PV Energy Management System!</p>
                <p className="text-sm">Please configure your system settings to get started.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="system">System Configuration</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account Settings</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>

        {/* System Configuration Tab */}
        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaSolarPanel className="mr-2 text-teal-600" />
                  Solar System Configuration
                </CardTitle>
                <CardDescription>Configure your PV system settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="solar_capacity" className="text-right">
                      Solar Capacity
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Input
                        id="solar_capacity"
                        name="solar_capacity"
                        type="number"
                        value={config.solar_capacity}
                        onChange={handleNumberInputChange}
                        min="0"
                        step="0.1"
                        className="w-20"
                      />
                      <span className="ml-2">kW</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="panel_type" className="text-right">
                      Panel Type
                    </Label>
                    <Select
                      value={config.panel_type || "monocrystalline"}
                      onValueChange={(value) => handleInputChange({ target: { name: "panel_type", value } })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select panel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monocrystalline">Monocrystalline</SelectItem>
                        <SelectItem value="polycrystalline">Polycrystalline</SelectItem>
                        <SelectItem value="thin_film">Thin Film</SelectItem>
                        <SelectItem value="bifacial">Bifacial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="installation_date" className="text-right">
                      Installation Date
                    </Label>
                    <Input
                      id="installation_date"
                      name="installation_date"
                      type="date"
                      value={config.installation_date || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="orientation" className="text-right">
                      Orientation
                    </Label>
                    <Select
                      value={config.orientation || "south"}
                      onValueChange={(value) => handleInputChange({ target: { name: "orientation", value } })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select orientation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="north">North</SelectItem>
                        <SelectItem value="northeast">Northeast</SelectItem>
                        <SelectItem value="east">East</SelectItem>
                        <SelectItem value="southeast">Southeast</SelectItem>
                        <SelectItem value="south">South</SelectItem>
                        <SelectItem value="southwest">Southwest</SelectItem>
                        <SelectItem value="west">West</SelectItem>
                        <SelectItem value="northwest">Northwest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tilt" className="text-right">
                      Tilt Angle
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Input
                        id="tilt"
                        name="tilt"
                        type="number"
                        value={config.tilt || 30}
                        onChange={handleNumberInputChange}
                        min="0"
                        max="90"
                        className="w-20"
                      />
                      <span className="ml-2">degrees</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaBatteryFull className="mr-2 text-teal-600" />
                  Battery Configuration
                </CardTitle>
                <CardDescription>Configure your battery storage settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="battery_capacity" className="text-right">
                      Battery Capacity
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Input
                        id="battery_capacity"
                        name="battery_capacity"
                        type="number"
                        value={config.battery_capacity}
                        onChange={handleNumberInputChange}
                        min="0"
                        step="0.1"
                        className="w-20"
                      />
                      <span className="ml-2">kWh</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="battery_type" className="text-right">
                      Battery Type
                    </Label>
                    <Select
                      value={config.battery_type || "lithium_ion"}
                      onValueChange={(value) => handleInputChange({ target: { name: "battery_type", value } })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select battery type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lithium_ion">Lithium Ion</SelectItem>
                        <SelectItem value="lead_acid">Lead Acid</SelectItem>
                        <SelectItem value="flow">Flow Battery</SelectItem>
                        <SelectItem value="sodium_ion">Sodium Ion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="inverter_capacity" className="text-right">
                      Inverter Capacity
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Input
                        id="inverter_capacity"
                        name="inverter_capacity"
                        type="number"
                        value={config.inverter_capacity || 5}
                        onChange={handleNumberInputChange}
                        min="0"
                        step="0.1"
                        className="w-20"
                      />
                      <span className="ml-2">kW</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="min_soc" className="text-right">
                      Minimum State of Charge
                    </Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Slider
                        id="min_soc"
                        name="min_soc"
                        value={[config.min_soc || 10]}
                        min={0}
                        max={50}
                        step={1}
                        onValueChange={(value) => handleInputChange({ target: { name: "min_soc", value: value[0] } })}
                        className="flex-1"
                      />
                      <span className="w-10 text-center">{config.min_soc || 10}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="max_soc" className="text-right">
                      Maximum State of Charge
                    </Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Slider
                        id="max_soc"
                        name="max_soc"
                        value={[config.max_soc || 90]}
                        min={50}
                        max={100}
                        step={1}
                        onValueChange={(value) => handleInputChange({ target: { name: "max_soc", value: value[0] } })}
                        className="flex-1"
                      />
                      <span className="w-10 text-center">{config.max_soc || 90}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaHome className="mr-2 text-teal-600" />
                  Household Configuration
                </CardTitle>
                <CardDescription>Configure your home and location settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Input id="location" name="location" value={config.location} readOnly className="flex-1" />
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => setIsLocationDialogOpen(true)}
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="home_size" className="text-right">
                      Home Size
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Input
                        id="home_size"
                        name="home_size"
                        type="number"
                        value={config.home_size || 150}
                        onChange={handleNumberInputChange}
                        min="0"
                        className="w-20"
                      />
                      <span className="ml-2">m²</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="occupants" className="text-right">
                      Occupants
                    </Label>
                    <Input
                      id="occupants"
                      name="occupants"
                      type="number"
                      value={config.occupants || 2}
                      onChange={handleNumberInputChange}
                      min="1"
                      max="20"
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="grid_connection" className="text-right">
                      Grid Connected
                    </Label>
                    <div className="flex items-center col-span-3">
                      <Switch
                        id="grid_connection"
                        checked={config.grid_connection}
                        onCheckedChange={(checked) => handleToggleChange("grid_connection", checked)}
                      />
                      <Label htmlFor="grid_connection" className="ml-2">
                        {config.grid_connection ? "Yes" : "No"}
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="smart_meter_enabled" className="text-right">
                      Smart Meter
                    </Label>
                    <div className="flex items-center col-span-3">
                      <Switch
                        id="smart_meter_enabled"
                        checked={config.smart_meter_enabled}
                        onCheckedChange={(checked) => handleToggleChange("smart_meter_enabled", checked)}
                      />
                      <Label htmlFor="smart_meter_enabled" className="ml-2">
                        {config.smart_meter_enabled ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaExchangeAlt className="mr-2 text-teal-600" />
                  Energy Trading Configuration
                </CardTitle>
                <CardDescription>Configure your energy trading settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price_per_kwh" className="text-right">
                      Grid Price
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <span className="mr-2">$</span>
                      <Input
                        id="price_per_kwh"
                        name="price_per_kwh"
                        type="number"
                        value={config.price_per_kwh}
                        onChange={handleNumberInputChange}
                        min="0"
                        step="0.01"
                        className="w-20"
                      />
                      <span className="ml-2">per kWh</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="export_price" className="text-right">
                      Export Price
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <span className="mr-2">$</span>
                      <Input
                        id="export_price"
                        name="export_price"
                        type="number"
                        value={config.export_price}
                        onChange={handleNumberInputChange}
                        min="0"
                        step="0.01"
                        className="w-20"
                      />
                      <span className="ml-2">per kWh</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="export_limit" className="text-right">
                      Export Limit
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Input
                        id="export_limit"
                        name="export_limit"
                        type="number"
                        value={config.export_limit}
                        onChange={handleNumberInputChange}
                        min="0"
                        step="0.1"
                        className="w-20"
                      />
                      <span className="ml-2">kW</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="trading_enabled" className="text-right">
                      P2P Trading
                    </Label>
                    <div className="flex items-center col-span-3">
                      <Switch
                        id="trading_enabled"
                        checked={config.trading_enabled || false}
                        onCheckedChange={(checked) => handleToggleChange("trading_enabled", checked)}
                      />
                      <Label htmlFor="trading_enabled" className="ml-2">
                        {config.trading_enabled ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="auto_trade" className="text-right">
                      Auto Trading
                    </Label>
                    <div className="flex items-center col-span-3">
                      <Switch
                        id="auto_trade"
                        checked={config.auto_trade || false}
                        onCheckedChange={(checked) => handleToggleChange("auto_trade", checked)}
                      />
                      <Label htmlFor="auto_trade" className="ml-2">
                        {config.auto_trade ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaBell className="mr-2 text-teal-600" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notification_email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="notification_email"
                      name="notification_email"
                      type="email"
                      value={config.notification_email}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="daily_summary" className="text-right">
                      Daily Summary
                    </Label>
                    <div className="flex items-center col-span-3">
                      <Switch
                        id="daily_summary"
                        checked={config.notification_preferences?.daily_summary ?? true}
                        onCheckedChange={(checked) => {
                          const newPreferences = {
                            ...config.notification_preferences,
                            daily_summary: checked,
                          }
                          handleInputChange({ target: { name: "notification_preferences", value: newPreferences } })
                        }}
                      />
                      <Label htmlFor="daily_summary" className="ml-2">
                        {config.notification_preferences?.daily_summary ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="alerts" className="text-right">
                      Alerts
                    </Label>
                    <div className="flex items-center col-span-3">
                      <Switch
                        id="alerts"
                        checked={config.notification_preferences?.alerts ?? true}
                        onCheckedChange={(checked) => {
                          const newPreferences = {
                            ...config.notification_preferences,
                            alerts: checked,
                          }
                          handleInputChange({ target: { name: "notification_preferences", value: newPreferences } })
                        }}
                      />
                      <Label htmlFor="alerts" className="ml-2">
                        {config.notification_preferences?.alerts ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tips" className="text-right">
                      Energy Tips
                    </Label>
                    <div className="flex items-center col-span-3">
                      <Switch
                        id="tips"
                        checked={config.notification_preferences?.tips ?? true}
                        onCheckedChange={(checked) => {
                          const newPreferences = {
                            ...config.notification_preferences,
                            tips: checked,
                          }
                          handleInputChange({ target: { name: "notification_preferences", value: newPreferences } })
                        }}
                      />
                      <Label htmlFor="tips" className="ml-2">
                        {config.notification_preferences?.tips ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="billing" className="text-right">
                      Billing Updates
                    </Label>
                    <div className="flex items-center col-span-3">
                      <Switch
                        id="billing"
                        checked={config.notification_preferences?.billing ?? true}
                        onCheckedChange={(checked) => {
                          const newPreferences = {
                            ...config.notification_preferences,
                            billing: checked,
                          }
                          handleInputChange({ target: { name: "notification_preferences", value: newPreferences } })
                        }}
                      />
                      <Label htmlFor="billing" className="ml-2">
                        {config.notification_preferences?.billing ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaCog className="mr-2 text-teal-600" />
                  Display Preferences
                </CardTitle>
                <CardDescription>Configure interface and display options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="theme" className="text-right">
                      Theme
                    </Label>
                    <Select
                      value={config.theme || "light"}
                      onValueChange={(value) => handleInputChange({ target: { name: "theme", value } })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="display_units" className="text-right">
                      Units
                    </Label>
                    <Select
                      value={config.display_units || "metric"}
                      onValueChange={(value) => handleInputChange({ target: { name: "display_units", value } })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metric">Metric (kWh, °C)</SelectItem>
                        <SelectItem value="imperial">Imperial (kWh, °F)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="default_view" className="text-right">
                      Default View
                    </Label>
                    <Select
                      value={config.default_view || "dashboard"}
                      onValueChange={(value) => handleInputChange({ target: { name: "default_view", value } })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select default view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="analytics">Analytics</SelectItem>
                        <SelectItem value="trading">Trading</SelectItem>
                        <SelectItem value="appliances">Appliances</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="chart_animations" className="text-right">
                      Chart Animations
                    </Label>
                    <div className="flex items-center col-span-3">
                      <Switch
                        id="chart_animations"
                        checked={config.chart_animations ?? true}
                        onCheckedChange={(checked) => handleToggleChange("chart_animations", checked)}
                      />
                      <Label htmlFor="chart_animations" className="ml-2">
                        {config.chart_animations ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="language" className="text-right">
                      Language
                    </Label>
                    <Select
                      value={config.language || "en"}
                      onValueChange={(value) => handleInputChange({ target: { name: "language", value } })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Account Settings Tab */}
        <TabsContent value="account">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaUser className="mr-2 text-teal-600" />
                  Account Information
                </CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    <Input id="username" value={user?.username || ""} readOnly className="col-span-3" />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input id="email" value={user?.email || ""} readOnly className="col-span-3" />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="full_name" className="text-right">
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={user?.full_name || ""}
                      onChange={() => {}}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-start-2 col-span-3 flex gap-2">
                      <Button variant="outline" onClick={handleUpdateProfile}>
                        Update Profile
                      </Button>
                      <Button variant="outline" className="text-red-600" onClick={logout}>
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaShieldAlt className="mr-2 text-teal-600" />
                  Security
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="current_password" className="text-right">
                      Current Password
                    </Label>
                    <Input id="current_password" type="password" className="col-span-3" />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new_password" className="text-right">
                      New Password
                    </Label>
                    <Input id="new_password" type="password" className="col-span-3" />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="confirm_password" className="text-right">
                      Confirm Password
                    </Label>
                    <Input id="confirm_password" type="password" className="col-span-3" />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="2fa" className="text-right">
                      2FA
                    </Label>
                    <div className="flex items-center col-span-3">
                      <Switch
                        id="2fa"
                        checked={config.two_factor_enabled || false}
                        onCheckedChange={(checked) => handleToggleChange("two_factor_enabled", checked)}
                      />
                      <Label htmlFor="2fa" className="ml-2">
                        {config.two_factor_enabled ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-start-2 col-span-3">
                      <Button onClick={handleChangePassword}>Change Password</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Settings Tab */}
        <TabsContent value="advanced">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaCog className="mr-2 text-teal-600" />
                  Advanced System Settings
                </CardTitle>
                <CardDescription>Configure advanced system parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="data_logging" className="text-right">
                      Data Logging Interval
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Input
                        id="data_logging"
                        name="data_logging_interval"
                        type="number"
                        value={config.data_logging_interval || 5}
                        onChange={handleNumberInputChange}
                        min="1"
                        className="w-20"
                      />
                      <span className="ml-2">minutes</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="data_retention" className="text-right">
                      Data Retention
                    </Label>
                    <Select
                      value={config.data_retention || "12_months"}
                      onValueChange={(value) => handleInputChange({ target: { name: "data_retention", value } })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select retention period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1_month">1 Month</SelectItem>
                        <SelectItem value="3_months">3 Months</SelectItem>
                        <SelectItem value="6_months">6 Months</SelectItem>
                        <SelectItem value="12_months">12 Months</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="api_access" className="text-right">
                      API Access
                    </Label>
                    <div className="flex items-center col-span-3">
                      <Switch
                        id="api_access"
                        checked={config.api_access || false}
                        onCheckedChange={(checked) => handleToggleChange("api_access", checked)}
                      />
                      <Label htmlFor="api_access" className="ml-2">
                        {config.api_access ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="debug_mode" className="text-right">
                      Debug Mode
                    </Label>
                    <div className="flex items-center col-span-3">
                      <Switch
                        id="debug_mode"
                        checked={config.debug_mode || false}
                        onCheckedChange={(checked) => handleToggleChange("debug_mode", checked)}
                      />
                      <Label htmlFor="debug_mode" className="ml-2">
                        {config.debug_mode ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="system_timezone" className="text-right">
                      System Timezone
                    </Label>
                    <Select
                      value={config.system_timezone || "auto"}
                      onValueChange={(value) => handleInputChange({ target: { name: "system_timezone", value } })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto Detect</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="us_eastern">US Eastern</SelectItem>
                        <SelectItem value="us_pacific">US Pacific</SelectItem>
                        <SelectItem value="europe_central">Europe Central</SelectItem>
                        <SelectItem value="asia_eastern">Asia Eastern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaShieldAlt className="mr-2 text-teal-600" />
                  System Management
                </CardTitle>
                <CardDescription>Advanced system management options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Data Export</h3>
                    <p className="text-sm text-gray-600">Export your energy data in CSV format for external analysis</p>
                    <Button variant="outline" className="w-full">
                      Export Energy Data
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">System Backup</h3>
                    <p className="text-sm text-gray-600">Create a backup of your system configuration</p>
                    <Button variant="outline" className="w-full">
                      Backup Configuration
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">System Reset</h3>
                    <p className="text-sm text-gray-600">
                      Reset your system to default settings (this cannot be undone)
                    </p>
                    <Button variant="destructive" className="w-full">
                      Reset System
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Location Dialog */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Location</DialogTitle>
            <DialogDescription>Enter your location to get accurate weather and solar forecasts</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location-input" className="text-right">
                Location
              </Label>
              <Input
                id="location-input"
                placeholder="City, Country"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="flex justify-center">
              <p className="text-sm text-gray-500">Or use automatic location detection</p>
            </div>
            <div className="flex justify-center">
              <Button variant="outline" className="w-full">
                <FaLocationArrow className="mr-2" />
                Detect Location
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLocationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLocation} disabled={!locationInput}>
              Update Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Settings

