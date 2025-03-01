"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import axios from "axios"

const EnergyUsageSummary = () => {
  const [usageData, setUsageData] = useState([])
  const [totalConsumption, setTotalConsumption] = useState(0)
  const [period, setPeriod] = useState("day")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsageData()
  }, []) // Removed unnecessary dependency: [period]

  const fetchUsageData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/appliance/usage-summary?period=${period}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setUsageData(response.data.usageData)
      setTotalConsumption(response.data.totalConsumption)
      setIsLoading(false)
    } catch (err) {
      console.error("Error fetching usage data:", err)
      setError("Failed to load energy usage data")
      setIsLoading(false)
    }
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  if (isLoading) return <div>Loading energy usage summary...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Usage Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={usageData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                {usageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <p className="text-lg font-semibold">
            Total {period}ly Consumption: {totalConsumption.toFixed(2)} kWh
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default EnergyUsageSummary

