"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Button } from "../ui/button"
import { Input } from "../ui/Input"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { Users, Battery, Zap, DollarSign, AlertTriangle } from "lucide-react"

const AdminDashboard = () => {
  const { user } = useAuth()
  const [systemData, setSystemData] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState("today")

  useEffect(() => {
    // Simulating API call to fetch system data
    const fetchSystemData = async () => {
      // In a real application, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSystemData({
        totalHouseholds: 1234,
        totalEnergyGenerated: 50000,
        totalEnergyTraded: 25000,
        systemRevenue: 10000,
        activeTrades: 50,
      })
    }

    fetchSystemData()
  }, [])

  // Generate mock chart data
  const generateChartData = () => {
    const data = []
    for (let i = 0; i < 7; i++) {
      data.push({
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        generation: Math.random() * 10000,
        consumption: Math.random() * 8000,
        trading: Math.random() * 5000,
      })
    }
    return data
  }

  const chartData = generateChartData()

  if (!systemData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Households</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemData.totalHouseholds}</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Energy Generated</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemData.totalEnergyGenerated.toLocaleString()} kWh</div>
            <p className="text-xs text-muted-foreground">+12.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Energy Traded</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemData.totalEnergyTraded.toLocaleString()} kWh</div>
            <p className="text-xs text-muted-foreground">+8.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${systemData.systemRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemData.activeTrades}</div>
            <p className="text-xs text-muted-foreground">-3.5% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Period Selector */}
      <div className="flex space-x-4 mb-6">
        {["Today", "This Week", "This Month", "This Year"].map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period.toLowerCase() ? "default" : "outline"}
            onClick={() => setSelectedPeriod(period.toLowerCase())}
          >
            {period}
          </Button>
        ))}
      </div>

      {/* System Performance Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="generation" stroke="#8884d8" name="Generation" />
                <Line type="monotone" dataKey="consumption" stroke="#82ca9d" name="Consumption" />
                <Line type="monotone" dataKey="trading" stroke="#ffc658" name="Trading" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Energy Distribution by Household Type */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Energy Distribution by Household Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { type: "Residential", generation: 30000, consumption: 25000 },
                  { type: "Commercial", generation: 15000, consumption: 18000 },
                  { type: "Industrial", generation: 5000, consumption: 7000 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="generation" fill="#8884d8" name="Generation" />
                <Bar dataKey="consumption" fill="#82ca9d" name="Consumption" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Adjust Energy Pricing</h3>
              <div className="flex items-center space-x-2">
                <Input type="number" placeholder="Set base price per kWh" />
                <Button>Update</Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">System Maintenance</h3>
              <Button variant="outline">Schedule Maintenance</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard

