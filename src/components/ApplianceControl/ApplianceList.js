"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Button } from "../ui/button"
import { Input } from "../ui/Input"
import { Label } from "../ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table"
import { toast } from "../ui/use-toast"
import axios from "axios"

const ApplianceList = () => {
  const [appliances, setAppliances] = useState([])
  const [newAppliance, setNewAppliance] = useState({ name: "", power: "", usage: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAppliances()
  }, [])

  const fetchAppliances = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/appliance/list", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setAppliances(response.data)
      setIsLoading(false)
    } catch (err) {
      console.error("Error fetching appliances:", err)
      setError("Failed to load appliances")
      setIsLoading(false)
    }
  }

  const addAppliance = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post("http://localhost:5000/api/appliance/add", newAppliance, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setAppliances([...appliances, response.data])
      setNewAppliance({ name: "", power: "", usage: "" })
      toast({
        title: "Appliance added",
        description: "The appliance has been successfully added to your list.",
      })
    } catch (err) {
      console.error("Error adding appliance:", err)
      toast({
        title: "Error",
        description: "Failed to add appliance. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removeAppliance = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/appliance/remove/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setAppliances(appliances.filter((appliance) => appliance.id !== id))
      toast({
        title: "Appliance removed",
        description: "The appliance has been successfully removed from your list.",
      })
    } catch (err) {
      console.error("Error removing appliance:", err)
      toast({
        title: "Error",
        description: "Failed to remove appliance. Please try again.",
        variant: "destructive",
      })
    }
  }

  const calculateDailyConsumption = (power, usage) => {
    return (power * usage) / 1000
  }

  if (isLoading) return <div>Loading appliances...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appliance Management</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={addAppliance} className="space-y-4 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Appliance Name</Label>
              <Input
                id="name"
                value={newAppliance.name}
                onChange={(e) => setNewAppliance({ ...newAppliance, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="power">Power Consumption (W)</Label>
              <Input
                id="power"
                type="number"
                value={newAppliance.power}
                onChange={(e) => setNewAppliance({ ...newAppliance, power: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="usage">Daily Usage (Hours)</Label>
              <Input
                id="usage"
                type="number"
                value={newAppliance.usage}
                onChange={(e) => setNewAppliance({ ...newAppliance, usage: e.target.value })}
                required
              />
            </div>
          </div>
          <Button type="submit">Add Appliance</Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Power (W)</TableHead>
              <TableHead>Daily Usage (Hours)</TableHead>
              <TableHead>Daily Consumption (kWh)</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appliances.map((appliance) => (
              <TableRow key={appliance.id}>
                <TableCell>{appliance.name}</TableCell>
                <TableCell>{appliance.power}</TableCell>
                <TableCell>{appliance.usage}</TableCell>
                <TableCell>{calculateDailyConsumption(appliance.power, appliance.usage).toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="destructive" onClick={() => removeAppliance(appliance.id)}>
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default ApplianceList

