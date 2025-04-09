"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaPlug,
  FaLightbulb,
  FaTrash,
  FaPencilAlt,
  FaPlus,
  FaPowerOff,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartLine,
  FaHome,
  FaUtensils,
  FaTv,
  FaSnowflake,
  FaWater,
  FaDesktop,
  FaSpinner,
} from "react-icons/fa"
import ApplianceService from "../services/appliance"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

// Common appliance presets for quick selection
const APPLIANCE_PRESETS = [
  { name: "Refrigerator", power_consumption: 150, daily_usage_hours: 24, type: "kitchen", location: "kitchen" },
  { name: "Washing Machine", power_consumption: 500, daily_usage_hours: 1, type: "utility", location: "utility_room" },
  { name: "Air Conditioner", power_consumption: 1500, daily_usage_hours: 6, type: "hvac", location: "living_room" },
  { name: "TV", power_consumption: 100, daily_usage_hours: 4, type: "entertainment", location: "living_room" },
  { name: "Laptop", power_consumption: 50, daily_usage_hours: 8, type: "electronics", location: "bedroom" },
  { name: "Oven", power_consumption: 2400, daily_usage_hours: 1, type: "kitchen", location: "kitchen" },
  { name: "Microwave", power_consumption: 1000, daily_usage_hours: 0.5, type: "kitchen", location: "kitchen" },
  { name: "Dishwasher", power_consumption: 1200, daily_usage_hours: 1, type: "kitchen", location: "kitchen" },
  { name: "Lighting", power_consumption: 60, daily_usage_hours: 5, type: "lighting", location: "living_room" },
  { name: "Water Heater", power_consumption: 4000, daily_usage_hours: 3, type: "utility", location: "bathroom" },
]

// Location options
const LOCATIONS = [
  { value: "living_room", label: "Living Room", icon: FaHome },
  { value: "kitchen", label: "Kitchen", icon: FaUtensils },
  { value: "bedroom", label: "Bedroom", icon: FaLightbulb },
  { value: "bathroom", label: "Bathroom", icon: FaWater },
  { value: "utility_room", label: "Utility Room", icon: FaPlug },
  { value: "office", label: "Office", icon: FaDesktop },
]

// Type options
const TYPES = [
  { value: "lighting", label: "Lighting", icon: FaLightbulb },
  { value: "kitchen", label: "Kitchen", icon: FaUtensils },
  { value: "entertainment", label: "Entertainment", icon: FaTv },
  { value: "hvac", label: "HVAC", icon: FaSnowflake },
  { value: "utility", label: "Utility", icon: FaPlug },
  { value: "electronics", label: "Electronics", icon: FaDesktop },
  { value: "other", label: "Other", icon: FaPlug },
]

// Colors for pie chart
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
]

const ApplianceControl = () => {
  const [appliances, setAppliances] = useState([])
  const [applianceStatus, setApplianceStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAppliance, setEditingAppliance] = useState(null)
  const [usageSummary, setUsageSummary] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState("day")
  const [activeTab, setActiveTab] = useState("appliances")

  const [newAppliance, setNewAppliance] = useState({
    name: "",
    type: "other",
    power_consumption: 0,
    daily_usage_hours: 0,
    is_smart: false,
    location: "living_room",
  })

  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch appliances and usage data
  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch all appliances
      const appliancesResponse = await ApplianceService.getAllAppliances()

      if (appliancesResponse.success) {
        setAppliances(appliancesResponse.appliances || [])

        // Initialize status for each appliance
        const initialStatus = {}
        if (Array.isArray(appliancesResponse.appliances)) {
          appliancesResponse.appliances.forEach((appliance) => {
            initialStatus[appliance.id] = appliance.is_on || false
          })
        }
        setApplianceStatus(initialStatus)
      } else {
        setError(appliancesResponse.error || "Failed to fetch appliances")
      }

      // Fetch usage summary
      const usageSummaryResponse = await ApplianceService.getUsageSummary(selectedPeriod)
      if (usageSummaryResponse.success) {
        setUsageSummary(usageSummaryResponse)
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to fetch appliance data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedPeriod])

  const toggleApplianceStatus = async (id, name, currentStatus) => {
    try {
      // Optimistically update UI
      setApplianceStatus((prev) => ({
        ...prev,
        [id]: !currentStatus,
      }))

      // Send request to backend
      const response = await ApplianceService.toggleAppliance(id, !currentStatus)

      if (response.success) {
        setSuccess(`${name} turned ${!currentStatus ? "on" : "off"} successfully`)

        // Refresh data to update consumption
        setTimeout(() => fetchData(), 1000)
      } else {
        throw new Error(response.error)
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
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

  const handleAddAppliance = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      if (!newAppliance.name || newAppliance.power_consumption <= 0) {
        setError("Please provide a name and valid power consumption")
        return
      }

      const response = await ApplianceService.addAppliance(newAppliance)

      if (response.success) {
        setSuccess("Appliance added successfully")
        setShowAddForm(false)
        setNewAppliance({
          name: "",
          type: "other",
          power_consumption: 0,
          daily_usage_hours: 0,
          is_smart: false,
          location: "living_room",
        })

        // Refresh appliance list
        fetchData()
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

  const handleUpdateAppliance = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      if (!editingAppliance.name || editingAppliance.power_consumption <= 0) {
        setError("Please provide a name and valid power consumption")
        return
      }

      const response = await ApplianceService.updateAppliance(editingAppliance.id, editingAppliance)

      if (response.success) {
        setSuccess("Appliance updated successfully")
        setEditingAppliance(null)

        // Refresh appliance list
        fetchData()
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

  const handleDeleteAppliance = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return
    }

    try {
      setLoading(true)

      const response = await ApplianceService.deleteAppliance(id)

      if (response.success) {
        setSuccess(`${name} deleted successfully`)

        // Refresh appliance list
        fetchData()
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

  const addPresetAppliance = async (preset) => {
    try {
      setLoading(true)

      const response = await ApplianceService.addAppliance(preset)

      if (response.success) {
        setSuccess(`${preset.name} added successfully`)

        // Refresh appliance list
        fetchData()
      } else {
        setError(response.error || "Failed to add preset appliance")
      }
    } catch (err) {
      console.error("Error adding preset appliance:", err)
      setError("Failed to add preset appliance. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Get icon for appliance type
  const getTypeIcon = (type) => {
    const typeObj = TYPES.find((t) => t.value === type) || TYPES[6] // Default to "other"
    const Icon = typeObj.icon
    return <Icon />
  }

  // Get icon for location
  const getLocationIcon = (location) => {
    const locationObj = LOCATIONS.find((l) => l.value === location) || LOCATIONS[0] // Default to living room
    const Icon = locationObj.icon
    return <Icon />
  }

  // Prepare data for pie chart
  const preparePieChartData = () => {
    if (!usageSummary || !usageSummary.appliances) return []

    return usageSummary.appliances.map((appliance) => ({
      name: appliance.name,
      value: appliance.energy_consumed,
    }))
  }

  // Prepare data for bar chart by location
  const prepareLocationChartData = () => {
    if (!usageSummary || !usageSummary.appliances) return []

    // Group by location
    const locationGroups = {}

    usageSummary.appliances.forEach((appliance) => {
      const location = appliance.location || "other"
      if (!locationGroups[location]) {
        locationGroups[location] = 0
      }
      locationGroups[location] += appliance.energy_consumed
    })

    // Convert to array for chart
    return Object.entries(locationGroups).map(([location, energy]) => {
      const locationObj = LOCATIONS.find((l) => l.value === location) || { label: location }
      return {
        name: locationObj.label || location,
        energy: energy,
      }
    })
  }

  if (loading && appliances.length === 0) {
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
          <h1 className="text-3xl font-bold text-teal-600">Appliance Management</h1>
          <p className="text-gray-600">Manage your household appliances and monitor energy usage</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <div className="flex items-center bg-white border rounded-md p-1.5 shadow-sm">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border-none focus:ring-0 text-sm font-medium"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <Button onClick={() => navigate("/dashboard")} className="bg-gray-200 hover:bg-gray-300 text-gray-800">
            Back to Dashboard
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
              <FaCheckCircle className="mr-2" />
              <p>{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "appliances"
              ? "text-teal-600 border-b-2 border-teal-600"
              : "text-gray-500 hover:text-teal-600"
          }`}
          onClick={() => setActiveTab("appliances")}
        >
          <FaPlug className="inline mr-2" />
          Appliances
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "usage" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-500 hover:text-teal-600"
          }`}
          onClick={() => setActiveTab("usage")}
        >
          <FaChartLine className="inline mr-2" />
          Usage Analytics
        </button>
      </div>

      {activeTab === "appliances" ? (
        <>
          {/* Appliance Management */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Your Appliances</CardTitle>
                  <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-teal-600 hover:bg-teal-700">
                    {showAddForm ? (
                      "Cancel"
                    ) : (
                      <>
                        <FaPlus className="mr-2" /> Add Appliance
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddForm && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-medium mb-4">Add New Appliance</h3>
                    <form onSubmit={handleAddAppliance} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={newAppliance.name}
                          onChange={(e) => setNewAppliance({ ...newAppliance, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          placeholder="e.g., Living Room TV"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Power Consumption (W)</label>
                        <input
                          type="number"
                          value={newAppliance.power_consumption}
                          onChange={(e) =>
                            setNewAppliance({ ...newAppliance, power_consumption: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          placeholder="e.g., 100"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Daily Usage (hours)</label>
                        <input
                          type="number"
                          value={newAppliance.daily_usage_hours}
                          onChange={(e) =>
                            setNewAppliance({ ...newAppliance, daily_usage_hours: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          placeholder="e.g., 4"
                          min="0"
                          max="24"
                          step="0.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={newAppliance.type}
                          onChange={(e) => setNewAppliance({ ...newAppliance, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        >
                          {TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <select
                          value={newAppliance.location}
                          onChange={(e) => setNewAppliance({ ...newAppliance, location: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        >
                          {LOCATIONS.map((location) => (
                            <option key={location.value} value={location.value}>
                              {location.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_smart"
                          checked={newAppliance.is_smart}
                          onChange={(e) => setNewAppliance({ ...newAppliance, is_smart: e.target.checked })}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_smart" className="ml-2 block text-sm text-gray-700">
                          Smart Appliance
                        </label>
                      </div>

                      <div className="md:col-span-2">
                        <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={loading}>
                          {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className="mr-2" />}
                          Add Appliance
                        </Button>
                      </div>
                    </form>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Add:</h4>
                      <div className="flex flex-wrap gap-2">
                        {APPLIANCE_PRESETS.map((preset, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => addPresetAppliance(preset)}
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-xs font-medium text-gray-800 transition-colors duration-200"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {editingAppliance && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-medium mb-4">Edit Appliance</h3>
                    <form onSubmit={handleUpdateAppliance} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={editingAppliance.name}
                          onChange={(e) => setEditingAppliance({ ...editingAppliance, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Power Consumption (W)</label>
                        <input
                          type="number"
                          value={editingAppliance.power_consumption}
                          onChange={(e) =>
                            setEditingAppliance({ ...editingAppliance, power_consumption: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Daily Usage (hours)</label>
                        <input
                          type="number"
                          value={editingAppliance.daily_usage_hours}
                          onChange={(e) =>
                            setEditingAppliance({ ...editingAppliance, daily_usage_hours: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          min="0"
                          max="24"
                          step="0.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={editingAppliance.type}
                          onChange={(e) => setEditingAppliance({ ...editingAppliance, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        >
                          {TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <select
                          value={editingAppliance.location}
                          onChange={(e) => setEditingAppliance({ ...editingAppliance, location: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        >
                          {LOCATIONS.map((location) => (
                            <option key={location.value} value={location.value}>
                              {location.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="edit_is_smart"
                          checked={editingAppliance.is_smart}
                          onChange={(e) => setEditingAppliance({ ...editingAppliance, is_smart: e.target.checked })}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="edit_is_smart" className="ml-2 block text-sm text-gray-700">
                          Smart Appliance
                        </label>
                      </div>

                      <div className="md:col-span-2 flex gap-2">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                          {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaPencilAlt className="mr-2" />}
                          Update Appliance
                        </Button>
                        <Button
                          type="button"
                          className="bg-gray-600 hover:bg-gray-700"
                          onClick={() => setEditingAppliance(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {appliances.length === 0 ? (
                  <div className="text-center py-8">
                    <FaPlug className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No appliances found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first appliance.</p>
                    <div className="mt-6">
                      <Button onClick={() => setShowAddForm(true)} className="bg-teal-600 hover:bg-teal-700">
                        <FaPlus className="mr-2" /> Add Appliance
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Appliance
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Power
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Location
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Usage
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {appliances.map((appliance) => (
                          <tr key={appliance.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                                  {getTypeIcon(appliance.type)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{appliance.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {TYPES.find((t) => t.value === appliance.type)?.label || "Other"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{appliance.power_consumption} W</div>
                              <div className="text-xs text-gray-500">
                                {((appliance.power_consumption * appliance.daily_usage_hours) / 1000).toFixed(2)}{" "}
                                kWh/day
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center text-gray-500">
                                  {getLocationIcon(appliance.location)}
                                </div>
                                <div className="ml-2 text-sm text-gray-900">
                                  {LOCATIONS.find((l) => l.value === appliance.location)?.label || appliance.location}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{appliance.daily_usage_hours} hours/day</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() =>
                                  toggleApplianceStatus(appliance.id, appliance.name, applianceStatus[appliance.id])
                                }
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  applianceStatus[appliance.id]
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                <div
                                  className={`h-2 w-2 rounded-full mr-2 ${
                                    applianceStatus[appliance.id] ? "bg-green-500" : "bg-gray-500"
                                  }`}
                                ></div>
                                {applianceStatus[appliance.id] ? "On" : "Off"}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    toggleApplianceStatus(appliance.id, appliance.name, applianceStatus[appliance.id])
                                  }
                                  className={`p-1 rounded-full ${
                                    applianceStatus[appliance.id]
                                      ? "bg-green-100 text-green-600 hover:bg-green-200"
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                                  title={applianceStatus[appliance.id] ? "Turn Off" : "Turn On"}
                                >
                                  <FaPowerOff className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingAppliance(appliance)}
                                  className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                                  title="Edit"
                                >
                                  <FaPencilAlt className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAppliance(appliance.id, appliance.name)}
                                  className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                  title="Delete"
                                >
                                  <FaTrash className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Usage Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Energy Consumption by Appliance</CardTitle>
                <CardDescription>
                  {selectedPeriod === "day" ? "Today's" : selectedPeriod === "week" ? "This week's" : "This month's"}{" "}
                  energy usage breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {usageSummary ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={preparePieChartData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {preparePieChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value.toFixed(2)} kWh`, ""]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No usage data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Energy Usage by Location</CardTitle>
                <CardDescription>Where energy is being consumed in your home</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {usageSummary ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareLocationChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis unit=" kWh" />
                        <Tooltip formatter={(value) => [`${value.toFixed(2)} kWh`, ""]} />
                        <Bar dataKey="energy" fill="#4FD1C5" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No location data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Total Energy Consumption</CardTitle>
              <CardDescription>Summary of your energy usage for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {usageSummary ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-medium text-gray-700">Total Consumption</h3>
                    <p className="text-3xl font-bold text-teal-600 mt-2">
                      {usageSummary.total_energy_consumed.toFixed(2)} kWh
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-medium text-gray-700">Estimated Cost</h3>
                    <p className="text-3xl font-bold text-teal-600 mt-2">
                      ${(usageSummary.total_energy_consumed * 0.15).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">At $0.15/kWh</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-medium text-gray-700">Active Appliances</h3>
                    <p className="text-3xl font-bold text-teal-600 mt-2">
                      {usageSummary.appliances.filter((a) => a.is_on).length} / {usageSummary.appliances.length}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No consumption data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default ApplianceControl

