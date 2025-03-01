"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
import { toast } from "../ui/use-toast"
import axios from "axios"

const ScheduleOptimizer = () => {
  const [appliances, setAppliances] = useState([])
  const [selectedAppliance, setSelectedAppliance] = useState("")
  const [optimizedTime, setOptimizedTime] = useState(null)
  const [isSmartSchedulingEnabled, setIsSmartSchedulingEnabled] = useState(false)
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

  const optimizeSchedule = async () => {
    if (!selectedAppliance) {
      toast({
        title: "Error",
        description: "Please select an appliance",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/appliance/optimize-schedule",
        { applianceId: selectedAppliance },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
      )
      setOptimizedTime(response.data.optimizedTime)
      toast({
        title: "Schedule Optimized",
        description: `Optimal time to run ${appliances.find((a) => a.id === selectedAppliance).name}: ${response.data.optimizedTime}`,
      })
    } catch (err) {
      console.error("Error optimizing schedule:", err)
      toast({
        title: "Error",
        description: "Failed to optimize schedule. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleSmartScheduling = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/appliance/toggle-smart-scheduling",
        { enabled: !isSmartSchedulingEnabled },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
      )
      setIsSmartSchedulingEnabled(response.data.enabled)
      toast({
        title: "Smart Scheduling",
        description: `Smart scheduling has been ${response.data.enabled ? "enabled" : "disabled"}.`,
      })
    } catch (err) {
      console.error("Error toggling smart scheduling:", err)
      toast({
        title: "Error",
        description: "Failed to toggle smart scheduling. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) return <div>Loading schedule optimizer...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Optimizer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="appliance">Select Appliance</label>
            <Select value={selectedAppliance} onValueChange={setSelectedAppliance}>
              <SelectTrigger>
                <SelectValue placeholder="Select an appliance" />
              </SelectTrigger>
              <SelectContent>
                {appliances.map((appliance) => (
                  <SelectItem key={appliance.id} value={appliance.id}>
                    {appliance.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={optimizeSchedule} disabled={!selectedAppliance}>
            Optimize Schedule
          </Button>
          {optimizedTime && <p>Optimized start time: {optimizedTime}</p>}
          <div className="flex items-center space-x-2">
            <Switch id="smart-scheduling" checked={isSmartSchedulingEnabled} onCheckedChange={toggleSmartScheduling} />
            <label htmlFor="smart-scheduling">Enable Smart Scheduling</label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ScheduleOptimizer

