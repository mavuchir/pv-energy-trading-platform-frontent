"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../config/axios" // Ensure axios is correctly configured in this file
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { FaPlug, FaTrash, FaEdit, FaExclamationTriangle } from "react-icons/fa"

const ApplianceControl = () => {
  const [appliances, setAppliances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newAppliance, setNewAppliance] = useState({
    name: "",
    power_consumption: 0,
    daily_usage_hours: 0,
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAppliance, setEditingAppliance] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchAppliances()
    }
  }, [user])

  const fetchAppliances = async () => {
    try {
      setLoading(true)
      const response = await api.get("/appliance/list")
      setAppliances(response.data)
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
      setLoading(true)
      await api.post("/appliance/add", newAppliance)
      setNewAppliance({
        name: "",
        power_consumption: 0,
        daily_usage_hours: 0,
      })
      setIsAddDialogOpen(false)
      await fetchAppliances()
    } catch (err) {
      console.error("Error adding appliance:", err)
      setError(err.response?.data?.msg || "Failed to add appliance")
    } finally {
      setLoading(false)
    }
  }

  const handleEditAppliance = async () => {
    try {
      setLoading(true)
      await api.put(`/appliance/update/${editingAppliance.id}`, editingAppliance)
      setIsEditDialogOpen(false)
      await fetchAppliances()
    } catch (err) {
      console.error("Error updating appliance:", err)
      setError(err.response?.data?.msg || "Failed to update appliance")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAppliance = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appliance?")) {
      return
    }

    try {
      setLoading(true)
      await api.delete(`/appliance/delete/${id}`)
      await fetchAppliances()
    } catch (err) {
      console.error("Error deleting appliance:", err)
      setError(err.response?.data?.msg || "Failed to delete appliance")
    } finally {
      setLoading(false)
    }
  }

  const calculateDailyEnergy = (power, hours) => {
    return (power * hours) / 1000 // kWh
  }

  if (!user) {
    return (
      <div className="p-4">
        <Card className="bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-yellow-600">
              <FaExclamationTriangle className="mr-2" />
              <p>Please log in to manage your appliances</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
      <h1 className="text-3xl font-bold mb-6 text-teal-600">Appliance Manager</h1>

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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <FaPlug className="mr-2" />
            Your Appliances
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700">Add Appliance</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Appliance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Appliance Name</Label>
                  <Input
                    id="name"
                    value={newAppliance.name}
                    onChange={(e) => setNewAppliance({ ...newAppliance, name: e.target.value })}
                    placeholder="e.g., Refrigerator"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="power">Power Consumption (Watts)</Label>
                  <Input
                    id="power"
                    type="number"
                    value={newAppliance.power_consumption}
                    onChange={(e) => setNewAppliance({ ...newAppliance, power_consumption: Number(e.target.value) })}
                    placeholder="e.g., 150"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Daily Usage Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.1"
                    value={newAppliance.daily_usage_hours}
                    onChange={(e) => setNewAppliance({ ...newAppliance, daily_usage_hours: Number(e.target.value) })}
                    placeholder="e.g., 24"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Daily Energy Consumption</Label>
                  <p className="text-sm font-medium">
                    {calculateDailyEnergy(newAppliance.power_consumption, newAppliance.daily_usage_hours).toFixed(2)}{" "}
                    kWh
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleAddAppliance}>
                  Add Appliance
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {appliances.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Appliance</th>
                    <th className="text-right py-2">Power (W)</th>
                    <th className="text-right py-2">Hours/Day</th>
                    <th className="text-right py-2">Daily (kWh)</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appliances.map((appliance) => (
                    <tr key={appliance.id} className="border-b">
                      <td className="py-2">{appliance.name}</td>
                      <td className="text-right py-2">{appliance.power_consumption}</td>
                      <td className="text-right py-2">{appliance.daily_usage_hours}</td>
                      <td className="text-right py-2">
                        {appliance.daily_energy
                          ? appliance.daily_energy.toFixed(2)
                          : calculateDailyEnergy(appliance.power_consumption, appliance.daily_usage_hours).toFixed(2)}
                      </td>
                      <td className="text-right py-2">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAppliance(appliance)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <FaEdit className="text-teal-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAppliance(appliance.id)}>
                            <FaTrash className="text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-medium">
                    <td className="py-2">Total</td>
                    <td className="text-right py-2"></td>
                    <td className="text-right py-2"></td>
                    <td className="text-right py-2">
                      {appliances
                        .reduce((sum, appliance) => {
                          const energy =
                            appliance.daily_energy ||
                            calculateDailyEnergy(appliance.power_consumption, appliance.daily_usage_hours)
                          return sum + energy
                        }, 0)
                        .toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center h-[200px] bg-gray-50 rounded-md">
              <p className="text-gray-500">No appliances added yet. Click "Add Appliance" to get started.</p>
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
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Appliance Name</Label>
                <Input
                  id="edit-name"
                  value={editingAppliance.name}
                  onChange={(e) => setEditingAppliance({ ...editingAppliance, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-power">Power Consumption (Watts)</Label>
                <Input
                  id="edit-power"
                  type="number"
                  value={editingAppliance.power_consumption}
                  onChange={(e) =>
                    setEditingAppliance({ ...editingAppliance, power_consumption: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hours">Daily Usage Hours</Label>
                <Input
                  id="edit-hours"
                  type="number"
                  step="0.1"
                  value={editingAppliance.daily_usage_hours}
                  onChange={(e) =>
                    setEditingAppliance({ ...editingAppliance, daily_usage_hours: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Daily Energy Consumption</Label>
                <p className="text-sm font-medium">
                  {calculateDailyEnergy(editingAppliance.power_consumption, editingAppliance.daily_usage_hours).toFixed(
                    2,
                  )}{" "}
                  kWh
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleEditAppliance}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ApplianceControl