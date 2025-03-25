"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/Card"
import { Button } from "./ui/button"
import { Input } from "./ui/Input"
import { Label } from "./ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/Table"
import { Switch } from "./ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
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
} from "./ui/AlertDialog"
import { FaPlug, FaEdit, FaTrash, FaPlus, FaSync, FaChartLine } from "react-icons/fa"
import { useToast } from "../hooks/use-toast"
import ApplianceService from "../services/appliance"
import EnergyService from "../services/energy"

const ApplianceManager = ({ initialAppliances = [] }) => {
  const [appliances, setAppliances] = useState(initialAppliances)
  const [formData, setFormData] = useState({
    name: "",
    power_consumption: "",
    daily_usage_hours: "",
    is_smart_device: false,
    is_schedulable: false,
  })
  const [editingId, setEditingId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalDailyConsumption, setTotalDailyConsumption] = useState(0)
  const [applianceStatus, setApplianceStatus] = useState({})
  const [realTimeConsumption, setRealTimeConsumption] = useState(0)
  const { toast } = useToast()

  // Fetch appliances on component mount
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
      const dailyEnergy = calculateDailyEnergy(appliance.power_consumption, appliance.daily_usage_hours)
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

  const fetchAppliances = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching appliances in ApplianceManager component")
      const result = await ApplianceService.getAppliances()

      if (result.success) {
        console.log("Successfully fetched appliances:", result.data)
        setAppliances(result.data)

        // Initialize status for each appliance
        const initialStatus = {}
        result.data.forEach((appliance) => {
          initialStatus[appliance.id] = appliance.is_on || false
        })
        setApplianceStatus(initialStatus)
      } else {
        console.error("Failed to fetch appliances:", result.error)
        setError(result.error)
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error in fetchAppliances:", err)
      setError("Failed to load appliances. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load appliances. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
        power_consumption: appliance.power_consumption.toString(),
        daily_usage_hours: appliance.daily_usage_hours.toString(),
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
      toast({
        title: "Validation Error",
        description: "Appliance name is required",
        variant: "destructive",
      })
      return false
    }

    const power = Number.parseFloat(formData.power_consumption)
    if (isNaN(power) || power < 0) {
      toast({
        title: "Validation Error",
        description: "Power consumption must be a positive number",
        variant: "destructive",
      })
      return false
    }

    const hours = Number.parseFloat(formData.daily_usage_hours)
    if (isNaN(hours) || hours < 0 || hours > 24) {
      toast({
        title: "Validation Error",
        description: "Daily usage hours must be between 0 and 24",
        variant: "destructive",
      })
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
        power_consumption: Number.parseFloat(formData.power_consumption),
        daily_usage_hours: Number.parseFloat(formData.daily_usage_hours),
        is_smart_device: formData.is_smart_device,
        is_schedulable: formData.is_schedulable,
      }

      let result

      if (editingId) {
        // Update existing appliance
        result = await ApplianceService.updateAppliance(editingId, applianceData)
      } else {
        // Add new appliance
        result = await ApplianceService.addAppliance(applianceData)
      }

      if (result.success) {
        toast({
          title: editingId ? "Appliance Updated" : "Appliance Added",
          description: editingId
            ? `${formData.name} has been updated successfully.`
            : `${formData.name} has been added to your appliances.`,
        })

        // Refresh the appliance list
        await fetchAppliances()

        handleCloseDialog()
      } else {
        toast({
          title: "Error",
          description: result.error || "An error occurred. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error submitting appliance:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id, name) => {
    try {
      const result = await ApplianceService.deleteAppliance(id)

      if (result.success) {
        toast({
          title: "Appliance Removed",
          description: `${name} has been removed from your appliances.`,
        })

        // Refresh the appliance list
        await fetchAppliances()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to remove appliance. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error deleting appliance:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
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
      const result = await ApplianceService.toggleAppliance(id, !currentStatus)

      if (result.success) {
        // If turning on, record energy consumption
        if (!currentStatus) {
          const appliance = appliances.find((a) => a.id === id)
          if (appliance) {
            // Record energy consumption when turning on
            await EnergyService.recordConsumption({
              amount: (appliance.power_consumption / 1000) * 0.25, // 15 minutes worth of consumption in kWh
              appliance_id: id,
            })
          }
        }

        toast({
          title: `Appliance ${!currentStatus ? "Turned On" : "Turned Off"}`,
          description: `${name} has been ${!currentStatus ? "turned on" : "turned off"} successfully`,
        })
      } else {
        // Revert UI state on error
        setApplianceStatus((prev) => ({
          ...prev,
          [id]: currentStatus,
        }))

        toast({
          title: "Error",
          description: result.error || "Failed to toggle appliance status",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error toggling appliance status:", err)

      // Revert UI state on error
      setApplianceStatus((prev) => ({
        ...prev,
        [id]: currentStatus,
      }))

      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
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
              <Button variant="outline" onClick={fetchAppliances} disabled={isLoading}>
                <FaSync className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
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

          {isLoading && appliances.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : appliances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No appliances found</p>
              <p className="text-sm mt-2">Add appliances to track your energy consumption</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Appliance</TableHead>
                    <TableHead className="text-right">Power (W)</TableHead>
                    <TableHead className="text-right">Daily Usage (h)</TableHead>
                    <TableHead className="text-right">Daily Energy (kWh)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appliances.map((appliance, index) => {
                    const dailyEnergy = calculateDailyEnergy(appliance.power_consumption, appliance.daily_usage_hours)
                    return (
                      <TableRow key={appliance.id || index}>
                        <TableCell className="font-medium">
                          {appliance.name}
                          {appliance.is_smart_device && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Smart
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{appliance.power_consumption}</TableCell>
                        <TableCell className="text-right">{appliance.daily_usage_hours}</TableCell>
                        <TableCell className="text-right">{dailyEnergy.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={applianceStatus[appliance.id] || false}
                              onCheckedChange={() =>
                                toggleApplianceStatus(
                                  appliance.id,
                                  appliance.name,
                                  applianceStatus[appliance.id] || false,
                                )
                              }
                            />
                            <span className={applianceStatus[appliance.id] ? "text-green-600" : "text-gray-500"}>
                              {applianceStatus[appliance.id] ? "ON" : "OFF"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
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
                                    onClick={() => handleDelete(appliance.id, appliance.name)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
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

