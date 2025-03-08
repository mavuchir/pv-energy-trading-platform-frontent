"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Button } from "../ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  FaSolarPanel,
  FaBolt,
  FaBatteryHalf,
  FaExchangeAlt,
  FaChartLine,
  FaExclamationTriangle,
  FaThermometerHalf,
  FaCloud,
  FaWind,
} from "react-icons/fa"

// Create axios instance with auth token
const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const HouseholdDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [statusData, setStatusData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // First check if the user is configured
        const userResponse = await api.get("/auth/me")
        if (!userResponse.data.is_configured) {
          setError("Your household is not configured yet. Please complete the configuration first.")
          setLoading(false)
          return
        }

        // Fetch data with error handling for each request
        let dashboardResponse, statusResponse

        try {
          dashboardResponse = await api.get("/household/dashboard")
          console.log("Dashboard response:", dashboardResponse.data)
        } catch (err) {
          console.error("Error fetching dashboard data:", err)
          // Try to get data from energy overview as fallback
          try {
            const overviewResponse = await api.get("/energy/overview")
            dashboardResponse = { data: overviewResponse.data }
            console.log("Using energy overview as fallback:", overviewResponse.data)
          } catch (overviewErr) {
            console.error("Error fetching overview data:", overviewErr)
          }
        }

        try {
          statusResponse = await api.get("/household/status")
          console.log("Status response:", statusResponse.data)
        } catch (err) {
          console.error("Error fetching status data:", err)
          // Try to get data from real-time as fallback
          try {
            const realtimeResponse = await api.get("/energy/real-time")
            statusResponse = {
              data: {
                current_generation: realtimeResponse.data.current.generation,
                current_consumption: realtimeResponse.data.current.consumption,
                battery_status: {
                  percentage: realtimeResponse.data.current.batteryLevel,
                  charge_rate: 0,
                },
                grid_status: realtimeResponse.data.current.gridStatus,
                energy_balance: realtimeResponse.data.current.generation - realtimeResponse.data.current.consumption,
              },
            }
            console.log("Using real-time data as fallback:", statusResponse.data)
          } catch (realtimeErr) {
            console.error("Error fetching real-time data:", realtimeErr)
          }
        }

        if (dashboardResponse?.data) {
          setDashboardData(dashboardResponse.data)
        }

        if (statusResponse?.data) {
          setStatusData(statusResponse.data)
        }

        if (!dashboardResponse?.data && !statusResponse?.data) {
          setError("Could not fetch any data from the server. Please try again later.")
        } else {
          setError(null)
        }
      } catch (err) {
        console.error("Error in data fetching:", err)
        setError(err.response?.data?.msg || "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const runSimulation = async () => {
    try {
      setLoading(true)
      await api.post("/household/simulate-smart-meter", {
        duration_minutes: 60,
        interval_seconds: 60,
      })
      // Refresh data after simulation
      const [dashboardRes, statusRes] = await Promise.all([
        api.get("/household/dashboard"),
        api.get("/household/status"),
      ])

      setDashboardData(dashboardRes.data)
      setStatusData(statusRes.data)
      setError(null)
    } catch (err) {
      console.error("Simulation error:", err)
      setError(err.response?.data?.msg || "Failed to run simulation")
    } finally {
      setLoading(false)
    }
  }

  // Fallback for missing data
  const getDefaultData = () => {
    return {
      today_generation: 0,
      today_consumption: 0,
      energy_forecast: [],
      weather: {
        temperature: 20,
        cloudCover: 50,
        solarIrradiance: 500,
        windSpeed: 5,
      },
    }
  }

  if (loading && !dashboardData && !statusData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (error && !dashboardData && !statusData) {
    return (
      <div className="p-4">
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <FaExclamationTriangle className="mr-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Use available data or fallbacks
  const dashboard = dashboardData || getDefaultData()
  const status = statusData || {
    current_generation: 0,
    current_consumption: 0,
    battery_status: { percentage: 0, charge_rate: 0 },
    grid_connection: false,
    grid_status: "disconnected",
    energy_balance: 0,
  }

  // Calculate energy balance
  const energyBalance = status.energy_balance || 0

  // Format forecast data for chart
  const forecastData = dashboard.energy_forecast || []

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-teal-600">Household Dashboard</h1>

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

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-t-4 border-teal-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-teal-600">
              <FaSolarPanel className="mr-2" />
              Current Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(status.current_generation || 0).toFixed(2)} kW</p>
            <p className="text-sm text-gray-500">From solar panels</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-orange-600">
              <FaBolt className="mr-2" />
              Current Consumption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(status.current_consumption || 0).toFixed(2)} kW</p>
            <p className="text-sm text-gray-500">From all appliances</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-blue-600">
              <FaBatteryHalf className="mr-2" />
              Battery Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {status.battery_status && typeof status.battery_status.percentage === "number"
                ? status.battery_status.percentage.toFixed(1)
                : "0.0"}
              %
            </p>
            <p className="text-sm text-gray-500">
              {status.battery_status && status.battery_status.charge_rate > 0
                ? `Charging at ${status.battery_status.charge_rate.toFixed(2)} kW`
                : status.battery_status && status.battery_status.charge_rate < 0
                  ? `Discharging at ${Math.abs(status.battery_status.charge_rate).toFixed(2)} kW`
                  : "Idle"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FaChartLine className="mr-2" />
            Daily Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-semibold">Total Generation</p>
              <p className="text-xl">{(dashboard.today_generation || 0).toFixed(2)} kWh</p>
            </div>
            <div>
              <p className="font-semibold">Total Consumption</p>
              <p className="text-xl">{(dashboard.today_consumption || 0).toFixed(2)} kWh</p>
            </div>
            <div>
              <p className="font-semibold">Energy Balance</p>
              <p className={`text-xl ${energyBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {energyBalance.toFixed(2)} kWh
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Energy Forecast Chart */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Energy Forecast (24 Hours)</CardTitle>
          <Button onClick={runSimulation} variant="outline" className="text-teal-600 border-teal-600 hover:bg-teal-50">
            Run Simulation
          </Button>
        </CardHeader>
        <CardContent>
          {forecastData && forecastData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="generation" stroke="#10b981" name="Generation (kW)" />
                <Line type="monotone" dataKey="consumption" stroke="#f97316" name="Consumption (kW)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-[300px] bg-gray-50 rounded-md">
              <p className="text-gray-500">No forecast data available. Run a simulation to generate data.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid Status and Trading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FaExchangeAlt className="mr-2" />
            Grid Status & Trading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="font-semibold mb-2">Grid Connection Status</p>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  status.grid_connection ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {status.grid_connection ? "Connected" : "Disconnected"}
              </div>

              {status.grid_connection && status.grid_status && (
                <div className="mt-2">
                  <p className="text-sm">
                    Current Status:
                    <span
                      className={`ml-1 font-medium ${
                        status.grid_status === "exporting"
                          ? "text-green-600"
                          : status.grid_status === "importing"
                            ? "text-orange-600"
                            : "text-gray-600"
                      }`}
                    >
                      {status.grid_status.charAt(0).toUpperCase() + status.grid_status.slice(1)}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="font-semibold mb-2">Trading Recommendation</p>
              {energyBalance >= 0 ? (
                <p className="text-green-600 mb-4">
                  You have excess energy. Consider selling {energyBalance.toFixed(2)} kWh to the grid or neighbors.
                </p>
              ) : (
                <p className="text-orange-600 mb-4">
                  You have an energy deficit of {Math.abs(energyBalance).toFixed(2)} kWh. Consider purchasing from the
                  grid or optimizing consumption.
                </p>
              )}
              <Button className="bg-teal-600 hover:bg-teal-700">View Trading Options</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Information */}
      {dashboard.weather && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaThermometerHalf className="mr-2" />
              Current Weather Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <FaThermometerHalf className="text-red-500 mr-2" />
                <div>
                  <p className="font-semibold">Temperature</p>
                  <p className="text-xl">{dashboard.weather.temperature}°C</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaCloud className="text-gray-500 mr-2" />
                <div>
                  <p className="font-semibold">Cloud Cover</p>
                  <p className="text-xl">{dashboard.weather.cloudCover}%</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaSolarPanel className="text-yellow-500 mr-2" />
                <div>
                  <p className="font-semibold">Solar Irradiance</p>
                  <p className="text-xl">{dashboard.weather.solarIrradiance} W/m²</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaWind className="text-blue-500 mr-2" />
                <div>
                  <p className="font-semibold">Wind Speed</p>
                  <p className="text-xl">{dashboard.weather.windSpeed} m/s</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default HouseholdDashboard

