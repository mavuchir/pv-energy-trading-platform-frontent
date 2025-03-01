"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import axios from "axios"

const EnergyDemandForecast = () => {
  const [forecastData, setForecastData] = useState([])
  const [period, setPeriod] = useState("week")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchForecastData()
  }, []) // Removed unnecessary dependency: period

  const fetchForecastData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/energy/demand-forecast?period=${period}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setForecastData(response.data)
      setIsLoading(false)
    } catch (err) {
      console.error("Error fetching forecast data:", err)
      setError("Failed to load energy demand forecast")
      setIsLoading(false)
    }
  }

  if (isLoading) return <div>Loading energy demand forecast...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Demand Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="demand" stroke="#8884d8" name="Energy Demand (kWh)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default EnergyDemandForecast

