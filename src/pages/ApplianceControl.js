"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/Input"
import { Switch } from "../components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/Tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Slider } from "../components/ui/Slider"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import {
  FaExclamationTriangle,
  FaPlug,
  FaLightbulb,
  FaThermometerHalf,
  FaTv,
  FaWater,
  FaWifi,
  FaTrash,
  FaEdit,
  FaPlus,
  FaChartLine,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa"
import ApplianceService from "../services/appliance"

const ApplianceControl = () => {
  const [appliances, setAppliances] = useState([])
  const [applianceStatus, setApplianceStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState("day")
  const [selectedAppliance, setSelectedAppliance] = useState(null)
  const [applianceUsageData, setApplianceUsageData] = useState([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [newAppliance, setNewAppliance] = useState({
    name: "",
    type: "other",
    power_consumption: 0,
    location: "living_room",
    is_smart: false,
    daily_usage_hours: 2,
  })
  const [scheduleSettings, setScheduleSettings] = useState({
    appliance_id: null,
    schedule_type: "daily",
    start_time: "08:00",
    end_time: "18:00",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    is_active: true,
  })
  const [activeTab, setActiveTab] = useState("all")
  const { user } = useAuth()

  // Fetch appliances
  const fetchAppliances = async () => {
    try {
      setLoading(true)
      const response = await ApplianceService.getAppliances()

      if (response.success) {
        setAppliances(response.data)

        // Initialize status for each appliance
        const initialStatus = {}
        response.data.forEach((appliance) => {
          initialStatus[appliance.id] = appliance.is_on || false
        })
        setApplianceStatus(initialStatus)
      } else {
        setError(response.error || "Failed to fetch appliances")
      }
    } catch (err) {
      console.error("Error fetching appliances:", err)
      setError("Failed to fetch appliances. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch appliance usage data
  const fetchApplianceUsageData = async (applianceId) => {
    try {
      setLoading(true)
      const response = await ApplianceService.getApplianceUsageHistory(applianceId, selectedPeriod)

      if (response.success) {
        setApplianceUsageData(response.data.usage_history || [])
      } else {
        setError(response.error || "Failed to fetch appliance usage data")
      }
    } catch (err) {
      console.error("Error fetching appliance usage data:", err)
      setError("Failed to fetch appliance usage data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppliances()
  }, [])

  useEffect(() => {
    if (selectedAppliance) {
      fetchApplianceUsageData(selectedAppliance.id)
    }
  }, [selectedAppliance, selectedPeriod])

  // Toggle appliance status
  const toggleApplianceStatus = async (id, currentStatus) => {
    try {
      // Optimistically update UI
      setApplianceStatus((prev) => ({
        ...prev,
        [id]: !currentStatus,
      }))

      // Send request to backend
      const response = await ApplianceService.toggleAppliance(id, !currentStatus)

      if (!response.success) {
        // Revert UI state on error
        setApplianceStatus((prev) => ({
          ...prev,
          [id]: currentStatus,
        }))
        setError(response.error || "Failed to toggle appliance status")
      }
    } catch (err) {
      console.error("Error toggling appliance status:", err)

      // Revert UI state on error
      setApplianceStatus((prev) => ({
        ...prev,
        [id]: currentStatus,
      }))

      setError("Failed to toggle appliance status. Please try again.")
    }
  }

  // Add new appliance
  const handleAddAppliance = async () => {
    try {
      setLoading(true)
      const response = await ApplianceService.addAppliance(newAppliance)

      if (response.success) {
        setIsAddDialogOpen(false)
        setNewAppliance({
          name: "",
          type: "other",
          power_consumption: 0,
          location: "living_room",
          is_smart: false,
          daily_usage_hours: 2,
        })
        fetchAppliances()
      } else {
        setError(response.error || "Failed to add appliance")
      }
    } catch (err) {
      console.error("Error adding appliance:", err)
      setError("Failed to add appliance. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Update appliance
  const handleUpdateAppliance = async () => {
    try {
      setLoading(true)
      const response = await ApplianceService.updateAppliance(selectedAppliance.id, selectedAppliance)

      if (response.success) {
        setIsEditDialogOpen(false)
        fetchAppliances()
      } else {
        setError(response.error || "Failed to update appliance")
      }
    } catch (err) {
      console.error("Error updating appliance:", err)
      setError("Failed to update appliance. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Delete appliance
  const handleDeleteAppliance = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appliance?")) {
      return
    }

    try {
      setLoading(true)
      const response = await ApplianceService.deleteAppliance(id)

      if (response.success) {
        fetchAppliances()
        if (selectedAppliance && selectedAppliance.id === id) {
          setSelectedAppliance(null)
        }
      } else {
        setError(response.error || "Failed to delete appliance")
      }
    } catch (err) {
      console.error("Error deleting appliance:", err)
      setError("Failed to delete appliance. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Save appliance schedule
  const handleSaveSchedule = async () => {
    try {
      setLoading(true)
      // This would typically call a backend endpoint to save the schedule
      // For now, we'll just simulate success
      setTimeout(() => {
        setIsScheduleDialogOpen(false)
        setLoading(false)
      }, 1000)
    } catch (err) {
      console.error("Error saving schedule:", err)
      setError("Failed to save schedule. Please try again.")
      setLoading(false)
    }
  }

  // Get icon for appliance type
  const getApplianceIcon = (type) => {
    switch (type) {
      case "light":
        return <FaLightbulb />
      case "hvac":
        return <FaThermometerHalf />
      case "entertainment":
        return <FaTv />
      case "kitchen":
        return <FaWater />
      case "smart_device":
        return <FaWifi />
      default:
        return <FaPlug />
    }
  }

  // Format appliance usage data for charts
  const formatApplianceUsageData = () => {
    return applianceUsageData.map((item) => ({
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date(item.timestamp).toLocaleDateString([], { month: "short", day: "numeric" }),
      energy: item.energy_consumed,
      status: item.status ? 1 : 0,
    }))
  }

  // Filter appliances by type
  const getFilteredAppliances = () => {
    if (!appliances || !Array.isArray(appliances) || appliances.length === 0) return []

    if (activeTab === "all") {
      return appliances
    }
    return appliances.filter((appliance) => appliance.type === activeTab)
  }

  // Calculate total power consumption of active appliances
  const calculateTotalActivePower = () => {
    if (!appliances || !Array.isArray(appliances) || appliances.length === 0) return 0

    return appliances
      .filter((appliance) => applianceStatus[appliance.id])
      .reduce((total, appliance) => total + (appliance.power_consumption || 0), 0)
  }

  if (loading && (!appliances || appliances.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-600">Appliance Control</h1>
          <p className="text-gray-600">Manage and monitor your household appliances</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-teal-600 hover:bg-teal-700">
            <FaPlus className="mr-2" />
            Add Appliance
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

      {/* Summary Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-teal-50 p-4 rounded-lg">
              <h3 className="font-medium text-teal-700 mb-2">Total Appliances</h3>
              <p className="text-2xl font-bold">{Array.isArray(appliances) ? appliances.length : 0}</p>
              <p className="text-sm text-gray-600">
                {Array.isArray(appliances) ? appliances.filter((a) => a.is_smart).length : 0} smart devices
              </p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg">
              <h3 className="font-medium text-teal-700 mb-2">Active Appliances</h3>
              <p className="text-2xl font-bold">{Object.values(applianceStatus).filter((status) => status).length}</p>
              <p className="text-sm text-gray-600">{calculateTotalActivePower().toFixed(0)} watts in use</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg">
              <h3 className="font-medium text-teal-700 mb-2">Estimated Daily Usage</h3>
              <p className="text-2xl font-bold">
                {Array.isArray(appliances)
                  ? appliances
                      .reduce(
                        (total, appliance) =>
                          total + ((appliance.power_consumption || 0) * (appliance.daily_usage_hours || 0)) / 1000,
                        0,
                      )
                      .toFixed(1)
                  : "0.0"}{" "}
                kWh
              </p>
              <p className="text-sm text-gray-600">Based on configured appliances</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Appliance List */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Appliances</CardTitle>
              <CardDescription>Control and manage your connected devices</CardDescription>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="light">Lighting</TabsTrigger>
                  <TabsTrigger value="hvac">HVAC</TabsTrigger>
                  <TabsTrigger value="kitchen">Kitchen</TabsTrigger>
                  <TabsTrigger value="entertainment">Entertainment</TabsTrigger>
                  <TabsTrigger value="smart_device">Smart Devices</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {getFilteredAppliances().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredAppliances().map((appliance) => (
                    <div
                      key={appliance.id}
                      className={`p-4 rounded-lg border ${applianceStatus[appliance.id] ? "bg-teal-50 border-teal-200" : "bg-white border-gray-200"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <div
                            className={`p-2 rounded-full mr-3 ${applianceStatus[appliance.id] ? "bg-teal-200 text-teal-700" : "bg-gray-100 text-gray-500"}`}
                          >
                            {getApplianceIcon(appliance.type)}
                          </div>
                          <div>
                            <h3 className="font-medium">{appliance.name}</h3>
                            <p className="text-sm text-gray-500">{appliance.location}</p>
                            <p className="text-xs text-gray-500 mt-1">{appliance.power_consumption} watts</p>
                          </div>
                        </div>
                        <Switch
                          checked={applianceStatus[appliance.id] || false}
                          onCheckedChange={() => toggleApplianceStatus(appliance.id, applianceStatus[appliance.id])}
                        />
                      </div>
                      <div className="flex mt-4 justify-between">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAppliance(appliance)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <FaEdit className="mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAppliance(appliance.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FaTrash className="mr-1" />
                            Delete
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAppliance(appliance)
                            fetchApplianceUsageData(appliance.id)
                          }}
                        >
                          <FaChartLine className="mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaPlug className="mx-auto text-gray-300 text-4xl mb-2" />
                  <p className="text-gray-500">No appliances found in this category</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                    <FaPlus className="mr-2" />
                    Add Appliance
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Appliance Details */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Appliance Details</CardTitle>
              <CardDescription>
                {selectedAppliance ? `Usage data for ${selectedAppliance.name}` : "Select an appliance to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAppliance ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full mr-3 ${applianceStatus[selectedAppliance.id] ? "bg-teal-200 text-teal-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {getApplianceIcon(selectedAppliance.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{selectedAppliance.name}</h3>
                        <p className="text-sm text-gray-500">{selectedAppliance.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`text-sm mr-2 ${applianceStatus[selectedAppliance.id] ? "text-green-600" : "text-gray-500"}`}
                      >
                        {applianceStatus[selectedAppliance.id] ? "ON" : "OFF"}
                      </span>
                      <Switch
                        checked={applianceStatus[selectedAppliance.id] || false}
                        onCheckedChange={() =>
                          toggleApplianceStatus(selectedAppliance.id, applianceStatus[selectedAppliance.id])
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-500">Power</p>
                      <p className="font-medium">{selectedAppliance.power_consumption} watts</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium capitalize">{selectedAppliance.type.replace("_", " ")}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-500">Daily Usage</p>
                      <p className="font-medium">{selectedAppliance.daily_usage_hours} hours</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-500">Smart Device</p>
                      <p className="font-medium">{selectedAppliance.is_smart ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Usage History</h3>
                    <div className="flex items-center bg-white border rounded-md p-1 shadow-sm">
                      <FaCalendarAlt className="text-teal-600 mr-2 ml-1" />
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="border-none focus:ring-0 text-xs font-medium"
                      >
                        <option value="day">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>
                  </div>

                  {applianceUsageData.length > 0 ? (
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formatApplianceUsageData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={selectedPeriod === "day" ? "time" : "date"} tick={{ fontSize: 10 }} />
                          <YAxis
                            label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft", fontSize: 10 }}
                            tick={{ fontSize: 10 }}
                          />
                          <Tooltip formatter={(value) => [`${value} kWh`, "Energy"]} />
                          <Bar dataKey="energy" name="Energy Used" fill="#4FD1C5" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-[200px] bg-gray-50 rounded-md">
                      <p className="text-gray-500 text-sm">No usage data available</p>
                    </div>
                  )}

                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setScheduleSettings({
                          ...scheduleSettings,
                          appliance_id: selectedAppliance.id,
                        })
                        setIsScheduleDialogOpen(true)
                      }}
                    >
                      <FaClock className="mr-2" />
                      Schedule
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedAppliance(null)}>
                      Close Details
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-md">
                  <FaPlug className="text-gray-300 text-4xl mb-2" />
                  <p className="text-gray-500">Select an appliance to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Appliance Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Appliance</DialogTitle>
            <DialogDescription>Enter the details of your appliance to add it to your system.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newAppliance.name}
                onChange={(e) => setNewAppliance({ ...newAppliance, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={newAppliance.type}
                onValueChange={(value) => setNewAppliance({ ...newAppliance, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Lighting</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="smart_device">Smart Device</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="power" className="text-right">
                Power (watts)
              </Label>
              <Input
                id="power"
                type="number"
                value={newAppliance.power_consumption}
                onChange={(e) => setNewAppliance({ ...newAppliance, power_consumption: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Select
                value={newAppliance.location}
                onValueChange={(value) => setNewAppliance({ ...newAppliance, location: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="living_room">Living Room</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="bedroom">Bedroom</SelectItem>
                  <SelectItem value="bathroom">Bathroom</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="usage" className="text-right">
                Daily Usage (hours)
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Slider
                  value={[newAppliance.daily_usage_hours]}
                  min={0}
                  max={24}
                  step={0.5}
                  onValueChange={(value) => setNewAppliance({ ...newAppliance, daily_usage_hours: value[0] })}
                  className="flex-1"
                />
                <span className="w-12 text-center">{newAppliance.daily_usage_hours}h</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="smart" className="text-right">
                Smart Device
              </Label>
              <div className="flex items-center col-span-3">
                <Switch
                  id="smart"
                  checked={newAppliance.is_smart}
                  onCheckedChange={(checked) => setNewAppliance({ ...newAppliance, is_smart: checked })}
                />
                <Label htmlFor="smart" className="ml-2">
                  {newAppliance.is_smart ? "Yes" : "No"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAppliance} disabled={!newAppliance.name}>
              Add Appliance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Appliance Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appliance</DialogTitle>
            <DialogDescription>Update the details of your appliance.</DialogDescription>
          </DialogHeader>
          {selectedAppliance && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={selectedAppliance.name}
                  onChange={(e) => setSelectedAppliance({ ...selectedAppliance, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-type" className="text-right">
                  Type
                </Label>
                <Select
                  value={selectedAppliance.type}
                  onValueChange={(value) => setSelectedAppliance({ ...selectedAppliance, type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Lighting</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="smart_device">Smart Device</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-power" className="text-right">
                  Power (watts)
                </Label>
                <Input
                  id="edit-power"
                  type="number"
                  value={selectedAppliance.power_consumption}
                  onChange={(e) =>
                    setSelectedAppliance({ ...selectedAppliance, power_consumption: Number(e.target.value) })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-location" className="text-right">
                  Location
                </Label>
                <Select
                  value={selectedAppliance.location}
                  onValueChange={(value) => setSelectedAppliance({ ...selectedAppliance, location: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="living_room">Living Room</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="bedroom">Bedroom</SelectItem>
                    <SelectItem value="bathroom">Bathroom</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-usage" className="text-right">
                  Daily Usage (hours)
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Slider
                    value={[selectedAppliance.daily_usage_hours]}
                    min={0}
                    max={24}
                    step={0.5}
                    onValueChange={(value) =>
                      setSelectedAppliance({ ...selectedAppliance, daily_usage_hours: value[0] })
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{selectedAppliance.daily_usage_hours}h</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-smart" className="text-right">
                  Smart Device
                </Label>
                <div className="flex items-center col-span-3">
                  <Switch
                    id="edit-smart"
                    checked={selectedAppliance.is_smart}
                    onCheckedChange={(checked) => setSelectedAppliance({ ...selectedAppliance, is_smart: checked })}
                  />
                  <Label htmlFor="edit-smart" className="ml-2">
                    {selectedAppliance.is_smart ? "Yes" : "No"}
                  </Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAppliance}>Update Appliance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Appliance</DialogTitle>
            <DialogDescription>Set up an automatic schedule for your appliance.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="schedule-type" className="text-right">
                Schedule Type
              </Label>
              <Select
                value={scheduleSettings.schedule_type}
                onValueChange={(value) => setScheduleSettings({ ...scheduleSettings, schedule_type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select schedule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-time" className="text-right">
                Start
              </Label>
              <Input
                id="start-time"
                type="time"
                value={scheduleSettings.start_time}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, start_time: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-time" className="text-right">
                End Time
              </Label>
              <Input
                id="end-time"
                type="time"
                value={scheduleSettings.end_time}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, end_time: e.target.value })}
                className="col-span-3"
              />
            </div>
            {scheduleSettings.schedule_type === "weekly" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Days</Label>
                <div className="col-span-3 flex flex-wrap gap-2">
                  {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={scheduleSettings.days.includes(day) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newDays = scheduleSettings.days.includes(day)
                          ? scheduleSettings.days.filter((d) => d !== day)
                          : [...scheduleSettings.days, day]
                        setScheduleSettings({ ...scheduleSettings, days: newDays })
                      }}
                      className="capitalize"
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="schedule-active" className="text-right">
                Active
              </Label>
              <div className="flex items-center col-span-3">
                <Switch
                  id="schedule-active"
                  checked={scheduleSettings.is_active}
                  onCheckedChange={(checked) => setScheduleSettings({ ...scheduleSettings, is_active: checked })}
                />
                <Label htmlFor="schedule-active" className="ml-2">
                  {scheduleSettings.is_active ? "Yes" : "No"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule}>Save Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ApplianceControl

