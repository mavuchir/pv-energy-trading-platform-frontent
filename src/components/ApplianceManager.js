"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Switch } from "../components/ui/switch"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/AlertDialog"
import {
  FaPlug,
  FaLightbulb,
  FaSnowflake,
  FaFan,
  FaTv,
  FaWater,
  FaWifi,
  FaDesktop,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSync,
  FaChartLine,
} from "react-icons/fa"
import api from "../config/axios"

const ApplianceManager = ({ initialAppliances = [] }) => {
  const [appliances, setAppliances] = useState(initialAppliances)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "other",
    power_consumption: "",
    daily_usage_hours: "",
    is_smart_device: false,
    is_schedulable: false,
  })
  const [editingId, setEditingId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applianceStatus, setApplianceStatus] = useState({})
  const [realTimeConsumption, setRealTimeConsumption] = useState(0)
  const [totalDailyConsumption, setTotalDailyConsumption] = useState(0)

  useEffect(() => {
    fetchAppliances()
  }, [])

  // Update appliances when initialAppliances changes
  useEffect(() => {
    if (initialAppliances && initialAppliances.length > 0) {
      setAppliances(initialAppliances)

      // Initialize status for each appliance
      const initialStatus = {}
      initialAppliances.forEach((appliance) => {
        initialStatus[appliance.id] = appliance.is_on || false
      })
      setApplianceStatus(initialStatus)
    }
  }, [initialAppliances])

  // Calculate total consumption whenever appliances change
  useEffect(() => {
    // Calculate total daily consumption
    const total = appliances.reduce((sum, appliance) => {
      const dailyEnergy = calculateDailyEnergy(appliance.power_consumption, appliance.daily_usage_hours || 8)
      return sum + dailyEnergy
    }, 0)
    setTotalDailyConsumption(total)

    // Calculate real-time consumption from active appliances
    const realTime = appliances.reduce((sum, appliance) => {
      if (applianceStatus[appliance.id]) {
        return sum + appliance.power_consumption / 1000 // Convert W to kW
      }
      return sum
    }, 0)
    setRealTimeConsumption(realTime)
  }, [appliances, applianceStatus])

  // Notify parent component when appliance status changes
  useEffect(() => {
    // If any appliance is toggled, refresh the dashboard data
    if (Object.keys(applianceStatus).length > 0 && window.refreshDashboardData) {
      window.refreshDashboardData()
    }
  }, [applianceStatus])

  const fetchAppliances = async () => {
    try {
      setLoading(true)
      const response = await api.get("/appliance/list")

      if (response.data) {
        setAppliances(response.data)

        // Initialize status for each appliance
        const initialStatus = {}
        response.data.forEach((appliance) => {
          initialStatus[appliance.id] = appliance.is_on || false
        })
        setApplianceStatus(initialStatus)
      }
      setError(null)
    } catch (err) {
      console.error("Error fetching appliances:", err)
      setError("Failed to load appliances. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const calculateDailyEnergy = (power, hours) => {
    const powerNum = Number.parseFloat(power) || 0
    const hoursNum = Number.parseFloat(hours) || 0
    return (powerNum * hoursNum) / 1000 // Convert to kWh
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "other",
      power_consumption: "",
      daily_usage_hours: "",
      is_smart_device: false,
      is_schedulable: false,
    })
    setEditingId(null)
  }

  const handleOpenDialog = (appliance = null) => {
    if (appliance) {
      setFormData({
        name: appliance.name,
        type: appliance.type || "other",
        power_consumption: appliance.power_consumption.toString(),
        daily_usage_hours: appliance.daily_usage_hours ? appliance.daily_usage_hours.toString() : "8",
        is_smart_device: appliance.is_smart_device || false,
        is_schedulable: appliance.is_schedulable || false,
      })
      setEditingId(appliance.id)
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Appliance name is required")
      return false
    }

    const power = Number.parseFloat(formData.power_consumption)
    if (isNaN(power) || power <= 0) {
      setError("Power consumption must be a positive number")
      return false
    }

    const hours = Number.parseFloat(formData.daily_usage_hours)
    if (isNaN(hours) || hours < 0 || hours > 24) {
      setError("Daily usage hours must be between 0 and 24")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const applianceData = {
        name: formData.name,
        type: formData.type,
        power_consumption: Number.parseFloat(formData.power_consumption),
        daily_usage_hours: Number.parseFloat(formData.daily_usage_hours),
        is_smart_device: formData.is_smart_device,
        is_schedulable: formData.is_schedulable,
      }

      let response

      if (editingId) {
        // Update existing appliance
        response = await api.post(`/appliance/update/${editingId}`, applianceData)
      } else {
        // Add new appliance
        response = await api.post("/appliance/add", applianceData)
      }

      if (response.data) {
        // Refresh the appliance list
        await fetchAppliances()
        handleCloseDialog()
      } else {
        setError("Failed to save appliance. Please try again.")
      }
    } catch (err) {
      console.error("Error submitting appliance:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteAppliance = async (id) => {
    try {
      await api.delete(`/appliance/delete/${id}`)
      // Refresh the appliance list
      await fetchAppliances()
    } catch (err) {
      console.error("Error deleting appliance:", err)
      setError("Failed to delete appliance. Please try again.")
    }
  }

  const toggleApplianceStatus = async (id, name, currentStatus) => {
    try {
      // Optimistically update UI
      setApplianceStatus((prev) => ({
        ...prev,
        [id]: !currentStatus,
      }))

      // Send request to backend
      await api.post(`/appliance/toggle/${id}`, {
        is_on: !currentStatus,
      })

      // If turning on, record energy consumption and affect generation
      if (!currentStatus) {
        const appliance = appliances.find((a) => a.id === id)
        if (appliance) {
          try {
            // Record energy consumption when turning on
            await api.post("/energy/record-consumption", {
              amount: (appliance.power_consumption / 1000) * 0.25, // 15 minutes worth of consumption in kWh
              appliance_id: id,
            })

            // Affect generation - simulate impact on energy balance
            await api.post("/energy/update-generation", {
              impact: -(appliance.power_consumption / 1000), // Negative impact on generation/energy balance
              source: "appliance_toggle",
            })
          } catch (recordErr) {
            console.error("Error recording consumption or updating generation:", recordErr)
            // Continue even if recording fails
          }
        }
      } else {
        // If turning off, update generation positively
        const appliance = appliances.find((a) => a.id === id)
        if (appliance) {
          try {
            // Affect generation - simulate positive impact on energy balance
            await api.post("/energy/update-generation", {
              impact: (appliance.power_consumption / 1000) * 0.5, // Positive impact when turning off (reduced consumption)
              source: "appliance_toggle",
            })
          } catch (updateErr) {
            console.error("Error updating generation:", updateErr)
          }
        }
      }

      // Trigger a refresh of the dashboard data to reflect changes
      // This assumes there's a parent component function or context method to refresh dashboard
      if (window.refreshDashboardData) {
        window.refreshDashboardData()
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

  const getApplianceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "light":
        return <FaLightbulb />
      case "refrigerator":
        return <FaSnowflake />
      case "fan":
        return <FaFan />
      case "tv":
        return <FaTv />
      case "water heater":
        return <FaWater />
      case "router":
        return <FaWifi />
      case "computer":
        return <FaDesktop />
      default:
        return <FaPlug />
    }
  }

  if (loading && appliances.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <FaPlug className="mr-2" />
                Appliance Management
              </CardTitle>
              <CardDescription>Manage your household appliances and track their energy consumption</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={fetchAppliances} disabled={loading}>
                <FaSync className={`mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <FaPlus className="mr-2" />
                    Add Appliance
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Edit Appliance" : "Add New Appliance"}</DialogTitle>
                    <DialogDescription>
                      {editingId
                        ? "Update the details of your appliance."
                        : "Add a new appliance to track its energy consumption."}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Appliance Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="e.g., Refrigerator"
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="type">Appliance Type</Label>
                        <select
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="light">Light</option>
                          <option value="refrigerator">Refrigerator</option>
                          <option value="fan">Fan</option>
                          <option value="tv">TV</option>
                          <option value="water heater">Water Heater</option>
                          <option value="router">Router/Modem</option>
                          <option value="computer">Computer</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="power_consumption">Power Consumption (Watts)</Label>
                        <Input
                          id="power_consumption"
                          name="power_consumption"
                          type="number"
                          min="0"
                          value={formData.power_consumption}
                          onChange={handleInputChange}
                          placeholder="e.g., 150"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="daily_usage_hours">Daily Usage (Hours)</Label>
                        <Input
                          id="daily_usage_hours"
                          name="daily_usage_hours"
                          type="number"
                          min="0"
                          max="24"
                          step="0.1"
                          value={formData.daily_usage_hours}
                          onChange={handleInputChange}
                          placeholder="e.g., 8"
                          required
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_smart_device"
                          checked={formData.is_smart_device}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_smart_device: checked })}
                        />
                        <Label htmlFor="is_smart_device">Smart Device</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_schedulable"
                          checked={formData.is_schedulable}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_schedulable: checked })}
                        />
                        <Label htmlFor="is_schedulable">Schedulable</Label>
                      </div>

                      {formData.power_consumption && formData.daily_usage_hours && (
                        <div className="bg-teal-50 p-3 rounded-md">
                          <p className="text-sm text-teal-800">
                            Daily Energy Consumption:{" "}
                            <span className="font-bold">
                              {calculateDailyEnergy(formData.power_consumption, formData.daily_usage_hours).toFixed(2)}{" "}
                              kWh
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : editingId ? "Update" : "Add"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">{error}</div>}

          {/* Real-time consumption card */}
          <Card className="mb-6 bg-teal-50 border-teal-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-teal-800 flex items-center">
                    <FaChartLine className="mr-2" />
                    Real-Time Energy Consumption
                  </h3>
                  <p className="text-sm text-teal-600 mt-1">Current consumption from active appliances:</p>
                  <p className="text-3xl font-bold text-teal-800 mt-2">{realTimeConsumption.toFixed(2)} kW</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-teal-600">Active appliances:</p>
                  <p className="text-xl font-semibold text-teal-800">
                    {Object.values(applianceStatus).filter((status) => status).length} / {appliances.length}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full"
                  style={{
                    width: `${Math.min((realTimeConsumption / (appliances.length ? appliances.reduce((max, a) => max + a.power_consumption / 1000, 0) : 1)) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {loading && appliances.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : appliances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No appliances found</p>
              <p className="text-sm mt-2">Add appliances to track your energy consumption</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appliances.map((appliance, index) => {
                const dailyEnergy = calculateDailyEnergy(appliance.power_consumption, appliance.daily_usage_hours || 8)
                const isOn = applianceStatus[appliance.id] || false

                return (
                  <Card
                    key={appliance.id || index}
                    className={`overflow-hidden border-l-4 ${isOn ? "border-l-green-500" : "border-l-gray-300"}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <span className={`mr-2 ${isOn ? "text-green-600" : "text-gray-500"}`}>
                            {getApplianceIcon(appliance.type)}
                          </span>
                          <CardTitle className="text-lg">{appliance.name}</CardTitle>
                        </div>
                        <Switch
                          checked={isOn}
                          onCheckedChange={() => toggleApplianceStatus(appliance.id, appliance.name, isOn)}
                          className={`${isOn ? "bg-green-500" : "bg-gray-300"}`}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Power:</p>
                          <p className="font-medium">{appliance.power_consumption} W</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Daily Usage:</p>
                          <p className="font-medium">{appliance.daily_usage_hours || 8} h</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Daily Energy:</p>
                          <p className="font-medium">{dailyEnergy.toFixed(2)} kWh</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status:</p>
                          <p className={`font-medium ${isOn ? "text-green-600" : "text-gray-500"}`}>
                            {isOn ? "ACTIVE" : "INACTIVE"}
                          </p>
                        </div>
                      </div>

                      {isOn && (
                        <div className="mt-2 bg-green-50 p-2 rounded-md text-xs text-green-800">
                          Currently consuming {(appliance.power_consumption / 1000).toFixed(2)} kW
                        </div>
                      )}
                    </CardContent>
                    <div className="bg-gray-50 px-4 py-2 flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(appliance)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <FaTrash className="text-red-500" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Appliance</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {appliance.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteAppliance(appliance.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 border-t">
          <div className="w-full">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Total Daily Consumption: <span className="font-bold">{totalDailyConsumption.toFixed(2)} kWh</span>
              </p>
              <p className="text-sm text-gray-500">
                Manage your appliances to track and optimize your household energy consumption.
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ApplianceManager

