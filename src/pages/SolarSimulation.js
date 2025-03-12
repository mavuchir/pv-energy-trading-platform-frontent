"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { Sun, Cloud, Battery, Zap } from "lucide-react"
import api from "../config/axios"

const SolarSimulation = () => {
  const [realTimeData, setRealTimeData] = useState(null)
  const [historicalData, setHistoricalData] = useState([])
  const [systemStatus, setSystemStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRealTimeData = useCallback(async () => {
    try {
      // Use the household status endpoint instead of real-time
      const statusResponse = await api.get("/household/status")
      const dashboardResponse = await api.get("/household/dashboard")

      // Transform the data to match our needs
      setRealTimeData({
        generation: statusResponse.data.current_generation * 1000, // Convert kW to W
        consumption: statusResponse.data.current_consumption * 1000,
        batteryLevel: statusResponse.data.battery_status.percentage,
        gridStatus: statusResponse.data.grid_status,
      })

      // Transform historical data
      if (dashboardResponse.data.energy_forecast) {
        setHistoricalData(
          dashboardResponse.data.energy_forecast.map((item) => ({
            timestamp: item.time,
            generation: item.generation * 1000,
            consumption: item.consumption * 1000,
          })),
        )
      }

      // Set system status including weather data
      setSystemStatus({
        efficiency: statusResponse.data.panel_efficiency * 100,
        weather: dashboardResponse.data.weather || {
          temperature: 20,
          cloudCover: 50,
          irradiance: 500,
        },
      })

      setError(null)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(error.response?.data?.msg || "Error fetching data")
    }
  }, [])

  useEffect(() => {
    fetchRealTimeData()
    // Update real-time data every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000)
    return () => clearInterval(interval)
  }, [fetchRealTimeData])

  const handleSimulation = async () => {
    try {
      setLoading(true)
      await api.post("/household/simulate-smart-meter", {
        duration_minutes: 60,
        interval_seconds: 60,
      })
      await fetchRealTimeData() // Refresh data after simulation
      setError(null)
    } catch (err) {
      console.error("Simulation error:", err)
      setError(err.response?.data?.msg || "Failed to run simulation")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !realTimeData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {error && (
        <Card className="mb-6 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sun className="mr-2" />
              Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeData?.generation?.toFixed(2) || "0"} W</div>
            <p className="text-sm text-muted-foreground">Efficiency: {systemStatus?.efficiency?.toFixed(1) || "0"}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2" />
              Consumption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeData?.consumption?.toFixed(2) || "0"} W</div>
            <p className="text-sm text-muted-foreground">Grid Status: {realTimeData?.gridStatus || "Unknown"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Battery className="mr-2" />
              Battery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeData?.batteryLevel?.toFixed(1) || "0"}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${realTimeData?.batteryLevel || 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cloud className="mr-2" />
              Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus?.weather?.temperature?.toFixed(1) || "0"}°C</div>
            <p className="text-sm text-muted-foreground">
              Cloud Cover: {systemStatus?.weather?.cloudCover?.toFixed(1) || "0"}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Live Energy Flow</CardTitle>
          <Button onClick={handleSimulation} disabled={loading}>
            {loading ? "Running Simulation..." : "Run Simulation"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="generation"
                  stackId="1"
                  stroke="#4ade80"
                  fill="#4ade80"
                  fillOpacity={0.3}
                  name="Generation (W)"
                />
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stackId="2"
                  stroke="#f43f5e"
                  fill="#f43f5e"
                  fillOpacity={0.3}
                  name="Consumption (W)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* System Efficiency Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Battery Level Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="batteryLevel"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    name="Battery Level (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Energy Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="generation" stroke="#4ade80" strokeWidth={2} name="Generation (W)" />
                  <Line type="monotone" dataKey="consumption" stroke="#f43f5e" strokeWidth={2} name="Consumption (W)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SolarSimulation

