"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Button } from "../../components/ui/button"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import {
  FaSolarPanel,
  FaBolt,
  FaBatteryHalf,
  FaExchangeAlt,
  FaExclamationTriangle,
  FaPlug,
  FaShoppingCart,
  FaSync,
} from "react-icons/fa"
import EnergyService from "../../services/energy"
import ApplianceService from "../../services/appliance"
import { useNavigate } from "react-router-dom"
import HouseholdService from "../../services/household"

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [statusData, setStatusData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("day")
  const [energyData, setEnergyData] = useState({
    generation: [],
    consumption: [],
  })
  const [appliances, setAppliances] = useState([])
  const [applianceStatus, setApplianceStatus] = useState({})
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [availableEnergy, setAvailableEnergy] = useState(0)
  const [currentPrice, setCurrentPrice] = useState(0.2)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [configurationCompleted, setConfigurationCompleted] = useState(true) // Default to true to avoid unnecessary redirects

  // Fetch all necessary data
  const fetchAllData = async () => {
    try {
      setLoading(true)

      // Fetch energy overview data with selected period
      const energyOverviewResponse = await EnergyService.getEnergyOverview(selectedPeriod)
      if (energyOverviewResponse.success) {
        setDashboardData(energyOverviewResponse.data)

        // Calculate available energy
        if (energyOverviewResponse.data.energy_balance) {
          const availableEnergyValue = Math.max(0, energyOverviewResponse.data.energy_balance).toFixed(1)
          setAvailableEnergy(availableEnergyValue)
        }

        // Set current price
        if (energyOverviewResponse.data.energy_prices?.p2p) {
          setCurrentPrice(energyOverviewResponse.data.energy_prices.p2p)
        }
      }

      // Fetch real-time status
      const realTimeResponse = await EnergyService.getRealTimeData()
      if (realTimeResponse.success) {
        setStatusData(realTimeResponse.data)
      }

      // Fetch energy generation data with selected period
      const generationResponse = await EnergyService.getGenerationData(selectedPeriod)

      // Fetch energy consumption data with selected period
      const consumptionResponse = await EnergyService.getConsumptionData(selectedPeriod)

      setEnergyData({
        generation: generationResponse.success ? generationResponse.data : [],
        consumption: consumptionResponse.success ? consumptionResponse.data : [],
      })

      // Fetch appliances
      const appliancesResponse = await ApplianceService.getAppliances()
      if (appliancesResponse.success) {
        setAppliances(appliancesResponse.data)

        // Initialize status for each appliance
        const initialStatus = {}
        appliancesResponse.data.forEach((appliance) => {
          initialStatus[appliance.id] = appliance.is_on || false
        })
        setApplianceStatus(initialStatus)
      }

      setError(null)
    } catch (err) {
      console.error("Error in data fetching:", err)
      setError(err.response?.data?.msg || "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()

    // Set up interval to refresh data every minute
    const interval = setInterval(() => {
      fetchAllData()
    }, 60000)

    return () => clearInterval(interval)
  }, [selectedPeriod, refreshTrigger])

  const runSimulation = async () => {
    try {
      setLoading(true)

      // Call the simulation endpoint
      await EnergyService.recordEnergyData({
        type: "generation",
        amount: Math.random() * 5,
        source: "solar",
        irradiance: Math.random() * 1000,
        temperature: 20 + Math.random() * 10,
      })

      // Refresh data after simulation
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      console.error("Simulation error:", err)
      setError("Failed to run simulation. Please try again.")
    } finally {
      setLoading(false)
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
      await ApplianceService.toggleAppliance(id, !currentStatus)

      // Refresh data to update consumption
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      console.error("Error toggling appliance status:", err)

      // Revert UI state on error
      setApplianceStatus((prev) => ({
        ...prev,
        [id]: currentStatus,
      }))

      setError("Failed to toggle appliance status. Please try again.")
    }
  }

  // Prepare data for charts
  const prepareChartData = () => {
    // Combine generation and consumption data for overview chart
    const chartData = []

    // Ensure both arrays exist before proceeding
    if (!Array.isArray(energyData.generation) || !Array.isArray(energyData.consumption)) {
      return chartData
    }

    // Use the longer array as the base
    const baseArray =
      energyData.generation.length >= energyData.consumption.length ? energyData.generation : energyData.consumption

    baseArray.forEach((item, index) => {
      const timestamp = new Date(item.timestamp)
      const timeStr = timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

      const genValue = index < energyData.generation?.length ? energyData.generation[index].amount : 0
      const consValue = index < energyData.consumption?.length ? energyData.consumption[index].amount : 0

      chartData.push({
        time: timeStr,
        generation: genValue,
        consumption: consValue,
        net: genValue - consValue,
      })
    })

    return chartData
  }

  // Check if user has completed configuration
  useEffect(() => {
    const checkConfigurationStatus = async () => {
      try {
        const completed = await HouseholdService.hasCompletedConfiguration()
        setConfigurationCompleted(completed)
      } catch (err) {
        console.error("Error checking configuration status:", err)
      }
    }

    if (user) {
      checkConfigurationStatus()
    }
  }, [user])

  // Redirect to settings if configuration is not completed
  useEffect(() => {
    if (user && configurationCompleted === false) {
      navigate("/settings")
    }
  }, [user, configurationCompleted, navigate])

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
  const dashboard = dashboardData || {
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

  const status = statusData || {
    generation: 0,
    consumption: 0,
    batteryLevel: 0,
    batteryChargeRate: 0,
    gridStatus: "disconnected",
    gridConnected: false,
    energyBalance: 0,
  }

  // Calculate real-time consumption based on active appliances
  const calculateRealTimeConsumption = () => {
    let totalConsumption = 0
    for (const appliance of appliances || []) {
      if (applianceStatus[appliance.id]) {
        totalConsumption += appliance.power_consumption / 1000 // Convert watts to kW
      }
    }
    return totalConsumption
  }

  // Prepare energy monitoring chart data
  const energyMonitoringData = prepareChartData().length > 0 ? prepareChartData() : []

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-600">Energy Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.full_name || user?.username || "User"}!</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <div className="flex items-center bg-white border rounded-md p-1.5 shadow-sm">
            <select
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value)
                // Show loading indicator
                setLoading(true)
                // Refresh data with new period
                setTimeout(() => fetchAllData(), 100)
              }}
              className="border-none focus:ring-0 text-sm font-medium"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <Button
            onClick={() => {
              setLoading(true)
              setRefreshTrigger((prev) => prev + 1)
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            <FaSync className={loading ? "mr-2 animate-spin" : "mr-2"} />
            Refresh
          </Button>
          <Button onClick={runSimulation} className="bg-teal-600 hover:bg-teal-700">
            Run Simulation
          </Button>
        </div>
      </div>

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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-yellow-100 rounded-full">
                <FaSolarPanel className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Generation</p>
                <p className="text-2xl font-bold text-yellow-700">{(status.generation || 0).toFixed(1)} kW</p>
                <p className="text-xs text-green-600">
                  {dashboard.today_generation > 0
                    ? `${dashboard.today_generation.toFixed(1)} kWh today`
                    : "No data yet"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-blue-100 rounded-full">
                <FaBolt className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Consumption</p>
                <p className="text-2xl font-bold text-blue-700">
                  {(status.consumption || calculateRealTimeConsumption()).toFixed(1)} kW
                </p>
                <p className="text-xs text-red-500">
                  {dashboard.today_consumption > 0
                    ? `${dashboard.today_consumption.toFixed(1)} kWh today`
                    : "No data yet"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-green-50 border-teal-100">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-teal-100 rounded-full">
                <FaBatteryHalf className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Battery Level</p>
                <p className="text-2xl font-bold text-teal-700">{status.batteryLevel?.toFixed(0) || "0"}%</p>
                <p className="text-xs text-gray-600">
                  {status.batteryChargeRate > 0
                    ? `Charging +${status.batteryChargeRate.toFixed(1)} kW`
                    : status.batteryChargeRate < 0
                      ? `Discharging ${status.batteryChargeRate.toFixed(1)} kW`
                      : "Idle"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-purple-100 rounded-full">
                <FaExchangeAlt className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Energy Balance</p>
                <p className="text-2xl font-bold text-purple-700">{availableEnergy} kWh</p>
                <p className="text-xs text-gray-600">Market value: ${(availableEnergy * currentPrice).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Energy Monitoring Chart */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Energy Monitoring</CardTitle>
              <CardDescription>
                {selectedPeriod === "day"
                  ? "Today's generation and consumption"
                  : selectedPeriod === "week"
                    ? "This week's energy flow"
                    : "This month's energy patterns"}
              </CardDescription>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: selectedPeriod !== "day" ? "numeric" : undefined,
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyMonitoringData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" />
                <YAxis unit=" kWh" />
                <Tooltip formatter={(value) => [`${value} kWh`, ""]} />
                <Area
                  type="monotone"
                  dataKey="generation"
                  stackId="1"
                  stroke="#4FD1C5"
                  fill="#4FD1C5"
                  fillOpacity={0.6}
                  name="Generation"
                />
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stackId="2"
                  stroke="#FC8181"
                  fill="#FC8181"
                  fillOpacity={0.6}
                  name="Consumption"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Quick Trading Card */}
        <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-teal-700">
              <FaShoppingCart className="mr-2" />
              Quick Trading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-xl font-bold text-teal-700">{availableEnergy} kWh</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-xl font-bold text-teal-700">${currentPrice.toFixed(2)}/kWh</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button onClick={() => navigate("/trading")} className="w-full bg-teal-600 hover:bg-teal-700">
                Trade Energy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Battery Status Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-blue-700">
              <FaBatteryHalf className="mr-2" />
              Battery Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-2">
              <div className="w-16 h-16 relative">
                <svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90">
                  <path
                    d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={status.batteryLevel > 70 ? "#48BB78" : status.batteryLevel > 30 ? "#ECC94B" : "#F56565"}
                    strokeWidth="3"
                    strokeDasharray={`${status.batteryLevel || 0}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-lg font-bold">{status.batteryLevel?.toFixed(0) || "0"}%</p>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div
                className={`h-2 rounded-full ${
                  status.batteryLevel > 70 ? "bg-green-500" : status.batteryLevel > 30 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${status.batteryLevel || 0}%` }}
              ></div>
            </div>
            <div className="space-y-2 mt-3">
              <Button onClick={() => navigate("/optimization")} className="w-full bg-blue-600 hover:bg-blue-700">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appliance Control Card */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-orange-700">
              <FaPlug className="mr-2" />
              Quick Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appliances?.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {appliances.slice(0, 4).map((appliance) => (
                  <Button
                    key={appliance.id}
                    variant={applianceStatus[appliance.id] ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleApplianceStatus(appliance.id, appliance.name, applianceStatus[appliance.id])}
                    className={`flex items-center justify-center ${
                      applianceStatus[appliance.id]
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "text-orange-600 border-orange-200 hover:bg-orange-50"
                    }`}
                  >
                    <span className="truncate">{appliance.name}</span>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 mb-2">No appliances configured</p>
            )}
            <Button
              onClick={() => navigate("/appliance-control")}
              className="w-full bg-orange-600 hover:bg-orange-700 mt-2"
            >
              Manage Appliances
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard

