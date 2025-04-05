"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card"
import { Button } from "./ui/button"
import { Input } from "./ui/Input"
import { Label } from "./ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog"
import { Switch } from "./ui/switch"
import { useToast } from "../hooks/use-toast"
import api from "../config/axios"
import { FaPlus, FaTrash, FaEdit, FaExclamationTriangle, FaPowerOff, FaChartLine } from "react-icons/fa"

const ApplianceControl = () => {
  const { toast } = useToast()
  const [appliances, setAppliances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newAppliance, setNewAppliance] = useState({
    name: "",
    power_consumption: 0,
    daily_usage_hours: 0,
    is_smart_device: false,
    is_schedulable: false,
  })
  const [editingAppliance, setEditingAppliance] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [applianceStatus, setApplianceStatus] = useState({}) // Track on/off status
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importData, setImportData] = useState("")

  useEffect(() => {
    fetchAppliances()
  }, [])

  const fetchAppliances = async () => {
    try {
      setLoading(true)
      const response = await api.get("/appliance/list")

      // Initialize status for each appliance
      const initialStatus = {}
      response.data.forEach((appliance) => {
        initialStatus[appliance.id] = appliance.is_on || false
      })

      setAppliances(response.data)
      setApplianceStatus(initialStatus)
      setError(null)
    } catch (err) {
      console.error("Error fetching appliances:", err)
      setError(err.response?.data?.msg || "Failed to fetch appliances")
    } finally {
      setLoading(false)
    }
  }

  const handleAddAppliance = async () => {
    try {
      if (!newAppliance.name || newAppliance.power_consumption <= 0 || newAppliance.daily_usage_hours <= 0) {
        toast({
          title: "Missing information",
          description: "Please fill in all fields with valid values",
          variant: "destructive",
        })
        return
      }

      if (newAppliance.daily_usage_hours > 24) {
        toast({
          title: "Invalid value",
          description: "Daily usage hours cannot exceed 24",
          variant: "destructive",
        })
        return
      }

      setLoading(true)
      await api.post("/appliance/add", {
        ...newAppliance,
        is_on: false, // Default to off
      })

      toast({
        title: "Appliance Added",
        description: `${newAppliance.name} has been added successfully`,
      })

      setNewAppliance({
        name: "",
        power_consumption: 0,
        daily_usage_hours: 0,
        is_smart_device: false,
        is_schedulable: false,
      })
      setIsAddDialogOpen(false)
      await fetchAppliances()
    } catch (err) {
      console.error("Error adding appliance:", err)
      toast({
        title: "Error",
        description: err.response?.data?.msg || "Failed to add appliance",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditAppliance = async () => {
    try {
      if (
        !editingAppliance.name ||
        editingAppliance.power_consumption <= 0 ||
        editingAppliance.daily_usage_hours <= 0
      ) {
        toast({
          title: "Missing information",
          description: "Please fill in all fields with valid values",
          variant: "destructive",
        })
        return
      }

      if (editingAppliance.daily_usage_hours > 24) {
        toast({
          title: "Invalid value",
          description: "Daily usage hours cannot exceed 24",
          variant: "destructive",
        })
        return
      }

      setLoading(true)
      await api.put(`/appliance/update/${editingAppliance.id}`, editingAppliance)

      toast({
        title: "Appliance Updated",
        description: `${editingAppliance.name} has been updated successfully`,
      })

      setIsEditDialogOpen(false)
      await fetchAppliances()
    } catch (err) {
      console.error("Error updating appliance:", err)
      toast({
        title: "Error",
        description: err.response?.data?.msg || "Failed to update appliance",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAppliance = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        setLoading(true)
        await api.delete(`/appliance/remove/${id}`)

        toast({
          title: "Appliance Removed",
          description: `${name} has been removed successfully`,
        })

        await fetchAppliances()
      } catch (err) {
        console.error("Error removing appliance:", err)
        toast({
          title: "Error",
          description: err.response?.data?.msg || "Failed to remove appliance",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
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

      // Record energy consumption if turning on
      if (!currentStatus) {
        const appliance = appliances.find((a) => a.id === id)
        if (appliance) {
          // Record energy consumption when turning on
          await api.post("/energy/record", {
            type: "consumption",
            amount: (appliance.power_consumption / 1000) * 0.25, // 15 minutes worth of consumption in kWh
            appliance_id: id,
          })
        }
      }

      toast({
        title: `Appliance ${!currentStatus ? "Turned On" : "Turned Off"}`,
        description: `${name} has been ${!currentStatus ? "turned on" : "turned off"} successfully`,
      })
    } catch (err) {
      console.error("Error toggling appliance status:", err)

      // Revert UI state on error
      setApplianceStatus((prev) => ({
        ...prev,
        [id]: currentStatus,
      }))

      toast({
        title: "Error",
        description: err.response?.data?.msg || "Failed to toggle appliance status",
        variant: "destructive",
      })
    }
  }

  const calculateRealTimeConsumption = () => {
    // Calculate consumption of all turned-on appliances
    return appliances.reduce((total, appliance) => {
      if (applianceStatus[appliance.id]) {
        return total + appliance.power_consumption / 1000 // Convert W to kW
      }
      return total
    }, 0)
  }

  const handleImportAppliances = async () => {
    try {
      let appliancesToImport = []

      try {
        appliancesToImport = JSON.parse(importData)

        if (!Array.isArray(appliancesToImport)) {
          throw new Error("Imported data must be an array of appliances")
        }
      } catch (parseError) {
        toast({
          title: "Invalid JSON",
          description: "Please provide valid JSON data for appliances",
          variant: "destructive",
        })
        return
      }

      setLoading(true)

      // Clear existing appliances if checkbox is checked
      if (document.getElementById("clear-existing").checked) {
        await api.delete("/appliance/clear-all")
      }

      // Add each appliance
      let addedCount = 0
      let errorCount = 0

      for (const appliance of appliancesToImport) {
        try {
          await api.post("/appliance/add", {
            name: appliance.name,
            power_consumption: appliance.power_consumption,
            daily_usage_hours: appliance.daily_usage_hours || 0,
            is_smart_device: appliance.is_smart_device || false,
            is_schedulable: appliance.is_schedulable || false,
            is_on: false,
          })
          addedCount++
        } catch (err) {
          console.error(`Error adding appliance ${appliance.name}:`, err)
          errorCount++
        }
      }

      toast({
        title: "Import Complete",
        description: `Added ${addedCount} appliances. ${errorCount > 0 ? `Failed to add ${errorCount} appliances.` : ""}`,
        variant: errorCount > 0 ? "warning" : "default",
      })

      setIsImportDialogOpen(false)
      setImportData("")
      await fetchAppliances()
    } catch (err) {
      console.error("Error importing appliances:", err)
      toast({
        title: "Error",
        description: "Failed to import appliances",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportAppliances = () => {
    const appliancesData = JSON.stringify(appliances, null, 2)
    const blob = new Blob([appliancesData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "appliances.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: `${appliances.length} appliances exported to JSON file`,
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Appliance Management</h1>

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

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Manage your household appliances to track energy consumption and optimize usage.
        </p>

        <div className="flex space-x-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Import Appliances</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Appliances</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="import-data">Paste JSON Data</Label>
                  <textarea
                    id="import-data"
                    className="w-full h-40 p-2 border rounded-md"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder='[
  {
    "name": "Refrigerator",
    "power_consumption": 150,
    "daily_usage_hours": 24
  },
  {
    "name": "TV",
    "power_consumption": 100,
    "daily_usage_hours": 4
  }
]'
                  ></textarea>
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="clear-existing" className="rounded border-gray-300" />
                  <Label htmlFor="clear-existing">Clear existing appliances</Label>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleImportAppliances} disabled={loading}>
                    {loading ? "Importing..." : "Import"}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={exportAppliances} disabled={appliances.length === 0}>
            Export Appliances
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <FaPlus className="mr-2" /> Add Appliance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Appliance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Appliance Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newAppliance.name}
                    onChange={(e) => setNewAppliance({ ...newAppliance, name: e.target.value })}
                    placeholder="e.g., Refrigerator"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="power_consumption">Power Consumption (W)</Label>
                  <Input
                    id="power_consumption"
                    name="power_consumption"
                    type="number"
                    value={newAppliance.power_consumption}
                    onChange={(e) => setNewAppliance({ ...newAppliance, power_consumption: Number(e.target.value) })}
                    min="1"
                    step="1"
                    placeholder="e.g., 150"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily_usage_hours">Daily Usage (hours)</Label>
                  <Input
                    id="daily_usage_hours"
                    name="daily_usage_hours"
                    type="number"
                    value={newAppliance.daily_usage_hours}
                    onChange={(e) => setNewAppliance({ ...newAppliance, daily_usage_hours: Number(e.target.value) })}
                    min="0.1"
                    max="24"
                    step="0.1"
                    placeholder="e.g., 24"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_smart_device"
                    checked={newAppliance.is_smart_device}
                    onCheckedChange={(checked) => setNewAppliance({ ...newAppliance, is_smart_device: checked })}
                  />
                  <Label htmlFor="is_smart_device">Smart Device</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_schedulable"
                    checked={newAppliance.is_schedulable}
                    onCheckedChange={(checked) => setNewAppliance({ ...newAppliance, is_schedulable: checked })}
                  />
                  <Label htmlFor="is_schedulable">Schedulable</Label>
                </div>

                <Button onClick={handleAddAppliance} disabled={loading} className="w-full">
                  {loading ? "Adding..." : "Add Appliance"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Real-time consumption card */}
      <Card className="mb-6 bg-teal-50 border-teal-200">
        <CardHeader>
          <CardTitle className="flex items-center text-teal-700">
            <FaChartLine className="mr-2" />
            Real-Time Energy Consumption
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-teal-600">Current consumption from active appliances:</p>
              <p className="text-3xl font-bold text-teal-800">{calculateRealTimeConsumption().toFixed(2)} kW</p>
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
                width: `${Math.min((calculateRealTimeConsumption() / (appliances.length ? appliances.reduce((max, a) => max + a.power_consumption / 1000, 0) : 1)) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Appliances</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && appliances.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : appliances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No appliances found</p>
              <p className="text-sm mt-2">Add appliances to track your energy consumption</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4">
                <FaPlus className="mr-2" /> Add Your First Appliance
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Appliance</th>
                    <th className="px-4 py-2 text-left">Power (W)</th>
                    <th className="px-4 py-2 text-left">Hours/Day</th>
                    <th className="px-4 py-2 text-left">Daily Energy (kWh)</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appliances.map((appliance) => (
                    <tr key={appliance.id} className="border-b">
                      <td className="px-4 py-2">{appliance.name}</td>
                      <td className="px-4 py-2">{appliance.power_consumption}</td>
                      <td className="px-4 py-2">{appliance.daily_usage_hours}</td>
                      <td className="px-4 py-2">
                        {appliance.daily_energy?.toFixed(2) ||
                          ((appliance.power_consumption * appliance.daily_usage_hours) / 1000).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          variant={applianceStatus[appliance.id] ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            toggleApplianceStatus(appliance.id, appliance.name, applianceStatus[appliance.id])
                          }
                          className={`${applianceStatus[appliance.id] ? "bg-green-600 hover:bg-green-700" : "text-red-600 border-red-200 hover:bg-red-50"}`}
                        >
                          <FaPowerOff className="mr-1" />
                          {applianceStatus[appliance.id] ? "ON" : "OFF"}
                        </Button>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingAppliance(appliance)
                              setIsEditDialogOpen(true)
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveAppliance(appliance.id, appliance.name)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </Button>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appliance</DialogTitle>
          </DialogHeader>
          {editingAppliance && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Appliance Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editingAppliance.name}
                  onChange={(e) => setEditingAppliance({ ...editingAppliance, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-power">Power Consumption (W)</Label>
                <Input
                  id="edit-power"
                  name="power_consumption"
                  type="number"
                  value={editingAppliance.power_consumption}
                  onChange={(e) =>
                    setEditingAppliance({ ...editingAppliance, power_consumption: Number(e.target.value) })
                  }
                  min="1"
                  step="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-hours">Daily Usage (hours)</Label>
                <Input
                  id="edit-hours"
                  name="daily_usage_hours"
                  type="number"
                  value={editingAppliance.daily_usage_hours}
                  onChange={(e) =>
                    setEditingAppliance({ ...editingAppliance, daily_usage_hours: Number(e.target.value) })
                  }
                  min="0.1"
                  max="24"
                  step="0.1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_smart_device"
                  checked={editingAppliance.is_smart_device}
                  onCheckedChange={(checked) => setEditingAppliance({ ...editingAppliance, is_smart_device: checked })}
                />
                <Label htmlFor="edit-is_smart_device">Smart Device</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_schedulable"
                  checked={editingAppliance.is_schedulable}
                  onCheckedChange={(checked) => setEditingAppliance({ ...editingAppliance, is_schedulable: checked })}
                />
                <Label htmlFor="edit-is_schedulable">Schedulable</Label>
              </div>

              <Button onClick={handleEditAppliance} disabled={loading} className="w-full">
                {loading ? "Updating..." : "Update Appliance"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ApplianceControl

