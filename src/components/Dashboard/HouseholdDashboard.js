"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaSolarPanel,
  FaBolt,
  FaBatteryHalf,
  FaExchangeAlt,
  FaExclamationTriangle,
  FaPlug,
  FaShoppingCart,
  FaSync,
  FaCheckCircle,
  FaChartLine,
  FaLightbulb,
  FaInfoCircle,
  FaCloudSun,
} from "react-icons/fa"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import energyService from "../../services/EnergyService"
import applianceService from "../../services/ApplianceService"
import socketService from "../../services/socketService"
import { useAuth } from "../../contexts/AuthContext"

const HouseholdDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [batteryStatus, setBatteryStatus] = useState(null)
  const [appliances, setAppliances] = useState([])
  const [applianceStatus, setApplianceStatus] = useState({})
  const [demandPrediction, setDemandPrediction] = useState([])
  const [productionPrediction, setProductionPrediction] = useState([])
  const [energyBalancePrediction, setEnergyBalancePrediction] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [chartTimeRange, setChartTimeRange] = useState("day")
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (realTimeUpdates) {
      socketService.connect()

      // Set up event listeners for real-time updates
      const productionUpdatedUnsubscribe = socketService.subscribe("production_updated", (data) => {
        console.log("Real-time production update:", data)
        refreshDashboardData()
      })

      const consumptionUpdatedUnsubscribe = socketService.subscribe("consumption_updated", (data) => {
        console.log("Real-time consumption update:", data)
        refreshDashboardData()
      })

      const batteryUpdatedUnsubscribe = socketService.subscribe("battery_updated", (data) => {
        console.log("Real-time battery update:", data.battery)
        setBatteryStatus(data.battery)
      })

      const applianceUpdatedUnsubscribe = socketService.subscribe("appliance_updated", (data) => {
        console.log("Real-time appliance update:", data)
        fetchAppliances()
      })

      // Clean up on unmount
      return () => {
        productionUpdatedUnsubscribe()
        consumptionUpdatedUnsubscribe()
        batteryUpdatedUnsubscribe()
        applianceUpdatedUnsubscribe()
        socketService.disconnect()
      }
    }
  }, [realTimeUpdates])

  // Initial data fetch
  useEffect(() => {
    fetchAllData()

    // Set up interval for periodic refresh (as backup for WebSocket)
    const interval = setInterval(() => {
      if (!socketService.isConnected()) {
        console.log("WebSocket disconnected. Using polling fallback.")
        fetchAllData()
      }
    }, 60000) // Refresh every minute if WebSocket is disconnected

    return () => clearInterval(interval)
  }, [refreshTrigger])

  // Refresh dashboard data (for WebSocket updates)
  const refreshDashboardData = () => {
    fetchDashboardData()
  }

  const fetchDashboardData = async () => {
    try {
      const data = await energyService.getDashboardData()
      if (data.success) {
        setDashboardData(data.data)

        // If battery data is included in dashboard, update battery status
        if (data.data.battery) {
          setBatteryStatus(data.data.battery)
        }

        // Clear any previous error for this data
        setErrors((prev) => ({ ...prev, dashboardData: null }))
      } else if (data.error) {
        setErrors((prev) => ({ ...prev, dashboardData: data.error }))
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setErrors((prev) => ({ ...prev, dashboardData: "Failed to fetch dashboard overview." }))
    }
  }

  const fetchBatteryStatus = async () => {
    try {
      const data = await energyService.getBatteryStatus()
      if (data.success) {
        setBatteryStatus(data.data)
        setErrors((prev) => ({ ...prev, batteryStatus: null }))
      } else if (data.error) {
        setErrors((prev) => ({ ...prev, batteryStatus: data.error }))
      }
    } catch (err) {
      console.error("Error fetching battery status:", err)
      setErrors((prev) => ({ ...prev, batteryStatus: "Failed to fetch battery status." }))
    }
  }

  const fetchAppliances = async () => {
    try {
      const data = await applianceService.getAppliances()
      if (data.success && data.appliances) {
        setAppliances(data.appliances)

        // Update appliance status state
        const initialStatus = {}
        data.appliances.forEach((appliance) => {
          initialStatus[appliance.id] = appliance.status === "on"
        })
        setApplianceStatus(initialStatus)

        setErrors((prev) => ({ ...prev, appliances: null }))
      } else if (data.error) {
        setErrors((prev) => ({ ...prev, appliances: data.error }))
      }
    } catch (err) {
      console.error("Error fetching appliances:", err)
      setErrors((prev) => ({ ...prev, appliances: "Failed to fetch appliances." }))
    }
  }

  const fetchPredictions = async () => {
    // Demand prediction
    try {
      const demand = await energyService.getDemandPrediction()
      if (demand.success && demand.predictions) {
        setDemandPrediction(demand.predictions)
        setErrors((prev) => ({ ...prev, demandPrediction: null }))
      } else if (demand.error) {
        setErrors((prev) => ({ ...prev, demandPrediction: demand.error }))
      }
    } catch (err) {
      console.error("Error fetching demand prediction:", err)
      setErrors((prev) => ({ ...prev, demandPrediction: "Failed to fetch demand prediction." }))
    }

    // Production prediction
    try {
      const production = await energyService.getProductionPrediction()
      if (production.success && production.predictions) {
        setProductionPrediction(production.predictions)
        setErrors((prev) => ({ ...prev, productionPrediction: null }))
      } else if (production.error) {
        setErrors((prev) => ({ ...prev, productionPrediction: production.error }))
      }
    } catch (err) {
      console.error("Error fetching production prediction:", err)
      setErrors((prev) => ({ ...prev, productionPrediction: "Failed to fetch production prediction." }))
    }

    // Energy balance
    try {
      const balance = await energyService.getEnergyBalance()
      if (balance.success && balance.balance) {
        setEnergyBalancePrediction(balance.balance)
        setErrors((prev) => ({ ...prev, energyBalance: null }))
      } else if (balance.error) {
        setErrors((prev) => ({ ...prev, energyBalance: balance.error }))
      }
    } catch (err) {
      console.error("Error fetching energy balance:", err)
      setErrors((prev) => ({ ...prev, energyBalance: "Failed to fetch energy balance." }))
    }

    // Recommendations
    try {
      const recommendationsData = await energyService.getRecommendations()
      if (recommendationsData.success && recommendationsData.recommendations) {
        setRecommendations(recommendationsData.recommendations)
        setErrors((prev) => ({ ...prev, recommendations: null }))
      } else if (recommendationsData.error) {
        setErrors((prev) => ({ ...prev, recommendations: recommendationsData.error }))
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err)
      setErrors((prev) => ({ ...prev, recommendations: "Failed to fetch recommendations." }))
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    // Reset global error
    setErrors((prev) => ({ ...prev, global: null }))

    try {
      // Use Promise.allSettled to continue even if some requests fail
      await Promise.allSettled([fetchDashboardData(), fetchBatteryStatus(), fetchAppliances(), fetchPredictions()])

      setSuccess("Dashboard data loaded successfully")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setErrors((prev) => ({ ...prev, global: "Error loading dashboard data." }))
    } finally {
      setLoading(false)
    }
  }

  const toggleApplianceStatus = async (id, name, currentStatus) => {
    try {
      // Optimistically update UI
      setApplianceStatus((prev) => ({ ...prev, [id]: !currentStatus }))

      const response = await applianceService.updateApplianceStatus(id, !currentStatus)

      if (response.success) {
        setSuccess(`${name} turned ${!currentStatus ? "on" : "off"} successfully`)
        setTimeout(() => setSuccess(null), 3000)

        // No need to immediately refresh if WebSockets are working,
        // as we'll get a real-time update
        if (!socketService.isConnected()) {
          setRefreshTrigger((prev) => prev + 1)
        }
      } else if (response.error) {
        setErrors((prev) => ({ ...prev, applianceToggle: response.error }))
        // Revert optimistic update
        setApplianceStatus((prev) => ({ ...prev, [id]: currentStatus }))
      }
    } catch (err) {
      console.error("Error toggling appliance status:", err)
      setErrors((prev) => ({ ...prev, applianceToggle: "Failed to toggle appliance status." }))
      // Revert optimistic update
      setApplianceStatus((prev) => ({ ...prev, [id]: currentStatus }))
    }
  }

  // Format data for charts
  const prepareEnergyChartData = () => {
    if (!dashboardData?.hourly) {
      return []
    }

    const productionData = dashboardData.hourly.production || []
    const consumptionData = dashboardData.hourly.consumption || []

    // Combine production and consumption data by hour
    const hourlyData = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let hour = 0; hour < 24; hour++) {
      const timeLabel = new Date(today).setHours(hour)
      const timeString = new Date(timeLabel).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

      const productionItem = productionData.find((item) => item.hour === hour)
      const consumptionItem = consumptionData.find((item) => item.hour === hour)

      hourlyData.push({
        time: timeString,
        hour,
        generation: productionItem ? productionItem.amount : 0,
        consumption: consumptionItem ? consumptionItem.amount : 0,
        netEnergy: (productionItem ? productionItem.amount : 0) - (consumptionItem ? consumptionItem.amount : 0),
      })
    }

    return hourlyData
  }

  const prepareForecastChartData = () => {
    if (!dashboardData?.forecast) {
      return []
    }

    const productionData = dashboardData.forecast.production || []
    const consumptionData = dashboardData.forecast.consumption || []

    // Combine production and consumption forecast data by timestamp
    const forecastData = []
    const timestamps = [
      ...new Set([...productionData.map((item) => item.timestamp), ...consumptionData.map((item) => item.timestamp)]),
    ].sort()

    timestamps.forEach((timestamp) => {
      const timeString = new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      const dateString = new Date(timestamp).toLocaleDateString([], { month: "short", day: "numeric" })

      const productionItem = productionData.find((item) => item.timestamp === timestamp)
      const consumptionItem = consumptionData.find((item) => item.timestamp === timestamp)

      forecastData.push({
        time: timeString,
        date: dateString,
        timestamp,
        forecastProduction: productionItem ? productionItem.amount : 0,
        forecastConsumption: consumptionItem ? consumptionItem.amount : 0,
        forecastBalance: (productionItem ? productionItem.amount : 0) - (consumptionItem ? consumptionItem.amount : 0),
      })
    })

    return forecastData
  }

  // Prepare data for prediction charts
  const preparePredictionChartData = (predictions) => {
    if (!predictions || predictions.length === 0) {
      return []
    }

    return predictions.map((item) => {
      const timeString = new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      return {
        time: timeString,
        hour: new Date(item.timestamp).getHours(),
        value: item.demand || item.production || item.balance || 0,
      }
    })
  }

  const energyChartData = prepareEnergyChartData()
  const forecastChartData = prepareForecastChartData()
  const demandChartData = preparePredictionChartData(demandPrediction)
  const productionChartData = preparePredictionChartData(productionPrediction)
  const balanceChartData = preparePredictionChartData(energyBalancePrediction)

  // Render loading state
  if (loading && !dashboardData && !batteryStatus && appliances.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  // Check if we have any data to display
  const hasAnyData =
    dashboardData ||
    batteryStatus ||
    appliances.length > 0 ||
    demandPrediction.length > 0 ||
    productionPrediction.length > 0 ||
    energyBalancePrediction.length > 0

  // Render global error state
  if (!hasAnyData && errors.global) {
    return (
      <div className="p-4">
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <div className="flex items-center text-red-600">
            <FaExclamationTriangle className="mr-2" />
            <p>{errors.global}</p>
          </div>
          <button
            onClick={() => {
              setLoading(true)
              setRefreshTrigger((prev) => prev + 1)
            }}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            <FaSync className="inline mr-2" /> Try Again
          </button>
        </div>
      </div>
    )
  }

  // Extract data from dashboardData
  const currentGeneration = dashboardData?.today?.production || 0
  const currentConsumption = dashboardData?.today?.consumption || 0
  const energyBalance = dashboardData?.today?.net || 0
  const weatherData = dashboardData?.weather
  const batteryLevel = batteryStatus?.percentage || 0
  const batteryCharge = batteryStatus?.charge_level || 0
  const batteryChargingRate = batteryStatus?.charging_rate || 0
  const isCharging = batteryChargingRate > 0
  const isDischarging = batteryChargingRate < 0

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-600">Energy Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.full_name || user?.username || "User"}!</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <button
            onClick={() => setRealTimeUpdates(!realTimeUpdates)}
            className={`px-4 py-2 rounded-md flex items-center ${
              realTimeUpdates
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {realTimeUpdates ? "Real-time On" : "Real-time Off"}
          </button>
          <button
            onClick={() => {
              setLoading(true)
              setRefreshTrigger((prev) => prev + 1)
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md flex items-center"
          >
            <FaSync className={loading ? "mr-2 animate-spin" : "mr-2"} />
            Refresh
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 p-4 rounded-md border border-green-200 mb-6">
          <div className="flex items-center text-green-600">
            <FaCheckCircle className="mr-2" />
            <p>{success}</p>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {Object.entries(errors).filter(([key, value]) => value && key !== "global").length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-6">
          <div className="flex items-start">
            <FaInfoCircle className="mr-2 mt-1 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Some data could not be loaded:</p>
              <ul className="mt-2 list-disc list-inside text-sm text-yellow-700">
                {Object.entries(errors)
                  .filter(([key, value]) => value && key !== "global")
                  .map(([key, value]) => (
                    <li key={key}>{value}</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Weather Information */}
      {weatherData && (
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
          <div className="flex items-start">
            <div className="mr-4 flex items-center">
              <FaCloudSun className="text-blue-600 mr-2" size={24} />
              <div>
                <h3 className="font-medium text-blue-800">Current Weather</h3>
                <p className="text-sm text-blue-700">Temperature: {weatherData.temperature}°C</p>
                <p className="text-sm text-blue-700">Cloud Cover: {weatherData.cloud_cover}%</p>
                <p className="text-sm text-blue-700">Solar Irradiance: {weatherData.irradiance} W/m²</p>
              </div>
            </div>
            <div className="ml-auto">
              <p className="text-sm text-blue-700">{weatherData.description || "Clear skies"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Generation Card */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 rounded-lg p-4">
          <div className="flex items-start">
            <div className="mr-2 p-2 bg-yellow-100 rounded-full">
              <FaSolarPanel className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Generation</p>
              <p className="text-2xl font-bold text-yellow-700">{currentGeneration.toFixed(2)} kWh</p>
              <p className="text-xs text-green-600">
                {dashboardData?.yesterday?.production > 0
                  ? `${(((currentGeneration - dashboardData.yesterday.production) / dashboardData.yesterday.production) * 100).toFixed(1)}% vs yesterday`
                  : "No data for yesterday"}
              </p>
            </div>
          </div>
        </div>

        {/* Consumption Card */}
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start">
            <div className="mr-2 p-2 bg-blue-100 rounded-full">
              <FaBolt className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Consumption</p>
              <p className="text-2xl font-bold text-blue-700">{currentConsumption.toFixed(2)} kWh</p>
              <p className="text-xs text-red-500">
                {dashboardData?.yesterday?.consumption > 0
                  ? `${(((currentConsumption - dashboardData.yesterday.consumption) / dashboardData.yesterday.consumption) * 100).toFixed(1)}% vs yesterday`
                  : "No data for yesterday"}
              </p>
            </div>
          </div>
        </div>

        {/* Battery Card */}
        <div className="bg-gradient-to-br from-teal-50 to-green-50 border border-teal-100 rounded-lg p-4">
          <div className="flex items-start">
            <div className="mr-2 p-2 bg-teal-100 rounded-full">
              <FaBatteryHalf className="text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Battery Level</p>
              <p className="text-2xl font-bold text-teal-700">{batteryLevel.toFixed(0)}%</p>
              <p className="text-xs text-gray-600">
                {isCharging
                  ? `Charging +${batteryChargingRate.toFixed(1)} kW`
                  : isDischarging
                    ? `Discharging ${batteryChargingRate.toFixed(1)} kW`
                    : "Idle"}
              </p>
            </div>
          </div>
        </div>

        {/* Energy Balance Card */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-lg p-4">
          <div className="flex items-start">
            <div className="mr-2 p-2 bg-purple-100 rounded-full">
              <FaExchangeAlt className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Energy Balance</p>
              <p className="text-2xl font-bold text-purple-700">{energyBalance.toFixed(2)} kWh</p>
              <p className="text-xs text-gray-600">{energyBalance >= 0 ? "Net producer" : "Net consumer"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Monitoring Chart */}
      {energyChartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md mb-6 p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Energy Monitoring</h2>
                <p className="text-sm text-gray-600">Real-time generation and consumption</p>
              </div>
              <div className="flex space-x-2">
                <select
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  value={chartTimeRange}
                  onChange={(e) => setChartTimeRange(e.target.value)}
                >
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" />
                <YAxis unit=" kWh" />
                <Tooltip formatter={(value) => [`${value.toFixed(2)} kWh`, ""]} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="generation"
                  stackId="1"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.6}
                  name="Generation"
                />
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stackId="2"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Consumption"
                />
                <Line
                  type="monotone"
                  dataKey="netEnergy"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  name="Net Energy"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Prediction Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Demand Prediction Chart */}
        {demandChartData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-blue-700 flex items-center">
                <FaChartLine className="mr-2" />
                Demand Prediction
              </h2>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demandChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" />
                  <YAxis unit=" kWh" />
                  <Tooltip formatter={(value) => [`${value.toFixed(2)} kWh`, ""]} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    name="Demand"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Production Prediction Chart */}
        {productionChartData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-green-700 flex items-center">
                <FaChartLine className="mr-2" />
                Production Prediction
              </h2>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" />
                  <YAxis unit=" kWh" />
                  <Tooltip formatter={(value) => [`${value.toFixed(2)} kWh`, ""]} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10B981"
                    name="Production"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Energy Balance Prediction Chart */}
        {balanceChartData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-purple-700 flex items-center">
                <FaChartLine className="mr-2" />
                Energy Balance Prediction
              </h2>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={balanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" />
                  <YAxis unit=" kWh" />
                  <Tooltip formatter={(value) => [`${value.toFixed(2)} kWh`, ""]} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8B5CF6"
                    name="Balance"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md mb-6 p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-orange-700 flex items-center">
              <FaLightbulb className="mr-2" />
              Recommendations
            </h2>
          </div>
          <div>
            <ul className="list-disc list-inside space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-gray-700">
                  {rec.message || rec.text}
                  {rec.action && <p className="text-xs text-orange-600 ml-5 mt-1">{rec.action}</p>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Quick Trading Card */}
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-lg p-4">
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-teal-700 flex items-center">
              <FaShoppingCart className="mr-2" />
              Quick Trading
            </h2>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-xl font-bold text-teal-700">
                {energyBalance > 0 ? energyBalance.toFixed(2) : "0.00"} kWh
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Market Price</p>
              <p className="text-xl font-bold text-teal-700">${(dashboardData?.market_price || 0.15).toFixed(3)}/kWh</p>
            </div>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/trading")}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Trade Energy
            </button>
          </div>
        </div>

        {/* Battery Status Card */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-4">
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-blue-700 flex items-center">
              <FaBatteryHalf className="mr-2" />
              Battery Status
            </h2>
          </div>
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
                  stroke={batteryLevel > 70 ? "#10B981" : batteryLevel > 30 ? "#F59E0B" : "#EF4444"}
                  strokeWidth="3"
                  strokeDasharray={`${batteryLevel}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-lg font-bold">{batteryLevel.toFixed(0)}%</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div
              className={`h-2 rounded-full ${
                batteryLevel > 70 ? "bg-green-500" : batteryLevel > 30 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${batteryLevel}%` }}
            ></div>
          </div>
          <div className="space-y-2 mt-3">
            <button
              onClick={() => navigate("/optimization")}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Appliance Control Card */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-lg p-4">
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-orange-700 flex items-center">
              <FaPlug className="mr-2" />
              Quick Controls
            </h2>
          </div>
          {appliances?.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {appliances.slice(0, 4).map((appliance) => (
                <button
                  key={appliance.id}
                  onClick={() => toggleApplianceStatus(appliance.id, appliance.name, applianceStatus[appliance.id])}
                  className={`flex items-center justify-center px-3 py-2 rounded-md ${
                    applianceStatus[appliance.id]
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "bg-white text-orange-600 border border-orange-200 hover:bg-orange-50"
                  }`}
                >
                  <span className="truncate">{appliance.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mb-2">No appliances configured</p>
          )}
          <button
            onClick={() => navigate("/appliance-control")}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 mt-2"
          >
            Manage Appliances
          </button>
        </div>
      </div>
    </div>
  )
}

export default HouseholdDashboard
