"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Button } from "../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts"
import {
  FaSolarPanel,
  FaBolt,
  FaBatteryHalf,
  FaExchangeAlt,
  FaChartLine,
  FaExclamationTriangle,
  FaPlug,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaComments,
  FaBell,
  FaSync,
  FaPowerOff,
} from "react-icons/fa"
import api from "../../config/axios"
import ApplianceManager from "../../components/ApplianceManager"
import ApplianceService from "../../services/appliance"
import EnergyService from "../../services/energy"




const HouseholdDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [statusData, setStatusData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("today")
  const [activeTab, setActiveTab] = useState("overview")
  const [notifications, setNotifications] = useState([])
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "system",
      message: "Welcome to your energy dashboard! How can I assist you today?",
      time: "Just now",
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const { user } = useAuth()
  const [appliances, setAppliances] = useState([])
  const [appliancesLoading, setAppliancesLoading] = useState(false)
  const [appliancesError, setAppliancesError] = useState(null)
  const [applianceStatus, setApplianceStatus] = useState({}) // Track on/off status
  const [energyData, setEnergyData] = useState({
    generation: [],
    consumption: [],
    battery: [],
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0) // Used to trigger refreshes

  // Function to fetch all necessary data
  const fetchAllData = async () => {
    try {
      setLoading(true)

      // Fetch user data to check if configured
      const userResponse = await api.get("/auth/me")
      if (!userResponse.data.is_configured) {
        setError("Your household is not configured yet. Please complete the configuration first.")
        setLoading(false)
        return
      }

      // Fetch appliances
      await fetchAppliances()

      // Fetch energy data
      await fetchEnergyData()

      // Fetch dashboard data
      await fetchDashboardData()

      setError(null)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err.response?.data?.msg || "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard data
      const dashboardResponse = await api.get("/household/dashboard", {
        params: { period: selectedPeriod },
      })

      if (dashboardResponse.data) {
        setDashboardData(dashboardResponse.data)

        // Generate notifications based on data
        generateNotifications(dashboardResponse.data)
      }

      // Fetch real-time status
      const statusResponse = await api.get("/household/status")
      if (statusResponse.data) {
        setStatusData(statusResponse.data)
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      // Try fallback methods if main endpoints fail
      try {
        const energyResponse = await EnergyService.getEnergyOverview(selectedPeriod)
        if (energyResponse.success) {
          setDashboardData(energyResponse.data)
        }

        const realtimeResponse = await EnergyService.getRealTimeData()
        if (realtimeResponse.success) {
          setStatusData({
            current_generation: realtimeResponse.data.generation,
            current_consumption: realtimeResponse.data.consumption,
            battery_status: {
              percentage: realtimeResponse.data.batteryLevel,
              charge_rate: realtimeResponse.data.batteryChargeRate,
            },
            grid_status: realtimeResponse.data.gridStatus,
            energy_balance: realtimeResponse.data.generation - realtimeResponse.data.consumption,
          })
        }
      } catch (fallbackErr) {
        console.error("Error with fallback data fetching:", fallbackErr)
      }
    }
  }

  const fetchEnergyData = async () => {
    try {
      // Fetch energy generation data
      const generationResponse = await EnergyService.getGenerationData(selectedPeriod)

      // Fetch energy consumption data
      const consumptionResponse = await EnergyService.getConsumptionData(selectedPeriod)

      // Fetch battery data
      const batteryResponse = await EnergyService.getBatteryData(selectedPeriod)

      setEnergyData({
        generation: generationResponse.success ? generationResponse.data : [],
        consumption: consumptionResponse.success ? consumptionResponse.data : [],
        battery: batteryResponse.success ? batteryResponse.data : [],
      })
    } catch (err) {
      console.error("Error fetching energy data:", err)
    }
  }

  const fetchAppliances = async () => {
    try {
      setAppliancesLoading(true)
      setAppliancesError(null)

      const result = await ApplianceService.getAppliances()

      if (result.success) {
        setAppliances(result.data)

        // Initialize status for each appliance
        const initialStatus = {}
        result.data.forEach((appliance) => {
          initialStatus[appliance.id] = appliance.is_on || false
        })
        setApplianceStatus(initialStatus)
      } else {
        setAppliancesError(result.error)
      }
    } catch (err) {
      console.error("Error fetching appliances:", err)
      setAppliancesError("Failed to load appliances")
    } finally {
      setAppliancesLoading(false)
    }
  }

  const generateNotifications = (data) => {
    const newNotifications = []

    // Check for high solar efficiency
    if (data.today_generation > 0 && data.solar_capacity) {
      const efficiency = (data.today_generation / (data.solar_capacity * 5)) * 100
      if (efficiency > 80) {
        newNotifications.push({
          id: Date.now(),
          message: `Solar efficiency is excellent at ${efficiency.toFixed(0)}%`,
          time: "Just now",
          read: false,
        })
      }
    }

    // Check battery status
    if (statusData?.battery_status?.percentage > 90) {
      newNotifications.push({
        id: Date.now() + 1,
        message: "Battery is almost full. Consider using stored energy.",
        time: "Just now",
        read: false,
      })
    } else if (statusData?.battery_status?.percentage < 20) {
      newNotifications.push({
        id: Date.now() + 2,
        message: "Battery level is low. Consider reducing consumption or charging from grid.",
        time: "Just now",
        read: false,
      })
    }

    // Check energy balance
    if (data.energy_balance && data.energy_balance < -2) {
      newNotifications.push({
        id: Date.now() + 3,
        message: `High energy deficit of ${Math.abs(data.energy_balance).toFixed(1)} kWh. Consider reducing consumption.`,
        time: "Just now",
        read: false,
      })
    }

    if (newNotifications.length > 0) {
      setNotifications((prev) => [...newNotifications, ...prev].slice(0, 10))
    }
  }

  useEffect(() => {
    fetchAllData()

    // Update data every minute
    const interval = setInterval(() => {
      fetchAllData()
    }, 60000)

    return () => clearInterval(interval)
  }, [selectedPeriod, refreshTrigger]) // Include refreshTrigger to force updates

  const runSimulation = async () => {
    try {
      setLoading(true)
      const response = await api.post("/household/simulate-smart-meter", {
        duration_minutes: 60,
        interval_seconds: 60,
      })

      // Add a chat message about simulation
      addChatMessage("system", "Simulation completed! Your energy data has been updated.")

      // Force refresh all data
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      console.error("Simulation error:", err)
      setError(err.response?.data?.msg || "Failed to run simulation")
      addChatMessage("system", "Simulation failed. Please try again later.")
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
      await api.post(`/appliance/toggle/${id}`, {
        is_on: !currentStatus,
      })

      // Add notification
      const newNotification = {
        id: Date.now(),
        message: `${name} has been ${!currentStatus ? "turned on" : "turned off"}`,
        time: "Just now",
        read: false,
      }
      setNotifications((prev) => [newNotification, ...prev].slice(0, 10))

      // Refresh data to update consumption
      fetchData()
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

  const addChatMessage = (sender, message) => {
    const newMsg = {
      id: chatMessages.length + 1,
      sender,
      message,
      time: "Just now",
    }
    setChatMessages([...chatMessages, newMsg])
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // Add user message
    addChatMessage("user", newMessage)

    // Simulate response based on user message
    setTimeout(() => {
      let response = "I'm not sure how to respond to that. Can you be more specific about your energy needs?"

      const msgLower = newMessage.toLowerCase()
      if (msgLower.includes("consumption")) {
        response = `Your current energy consumption is ${calculateRealTimeConsumption().toFixed(2)} kW.`
      } else if (msgLower.includes("generation")) {
        response = `Your solar panels are currently generating ${statusData?.current_generation.toFixed(2) || "0.00"} kW.`
      } else if (msgLower.includes("battery")) {
        response = `Your battery is at ${statusData?.battery_status?.percentage.toFixed(1) || "0.0"}% capacity.`
      } else if (msgLower.includes("save") || msgLower.includes("efficiency") || msgLower.includes("tip")) {
        response =
          "To improve efficiency, consider running major appliances during peak solar generation times, typically between 10am and 2pm."
      } else if (msgLower.includes("appliance") || msgLower.includes("device")) {
        const activeCount = Object.values(applianceStatus).filter((status) => status).length
        response = `You have ${appliances.length} appliances configured, with ${activeCount} currently active.`
      }

      addChatMessage("system", response)
    }, 1000)

    setNewMessage("")
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
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

  // Prepare data for charts
  const prepareChartData = () => {
    // Combine generation and consumption data for overview chart
    const chartData = []

    // Use the longer array as the base
    const baseArray =
      energyData.generation.length >= energyData.consumption.length ? energyData.generation : energyData.consumption

    baseArray.forEach((item, index) => {
      const genValue = index < energyData.generation.length ? energyData.generation[index].amount : 0
      const consValue = index < energyData.consumption.length ? energyData.consumption[index].amount : 0

      chartData.push({
        time: item.timestamp,
        generation: genValue,
        consumption: consValue,
        net: genValue - consValue,
      })
    })

    return chartData
  }

  // Dummy function for calculateRealTimeConsumption
  const calculateRealTimeConsumption = () => {
    // Replace this with your actual calculation logic
    let totalConsumption = 0
    for (const appliance of appliances) {
      if (applianceStatus[appliance.id]) {
        totalConsumption += appliance.power_consumption / 1000 // Convert watts to kW
      }
    }
    return totalConsumption
  }

  // Dummy function for fetchData
  const fetchData = async () => {
    // Replace this with your actual data fetching logic
    await fetchAllData()
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

  // Calculate energy balance based on real-time data
  const energyBalance = status.current_generation - calculateRealTimeConsumption()

  // Prepare chart data
  const chartData = prepareChartData()

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <p className="text-gray-600">Welcome back, {user?.full_name || user?.username || "User"}!</p>
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            className="relative"
            onClick={() => setActiveTab(activeTab === "notifications" ? "overview" : "notifications")}
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button variant="outline" onClick={() => setActiveTab(activeTab === "chat" ? "overview" : "chat")}>
            <FaComments />
          </Button>
          <Button onClick={() => setRefreshTrigger((prev) => prev + 1)} variant="outline">
            <FaSync />
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="appliances">Appliances</TabsTrigger>
          <TabsTrigger value="chat">Smart Assistant</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
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
                <p className="text-sm text-gray-500">From solar panels ({user?.solar_capacity || 0} kW capacity)</p>
                {user?.solar_capacity && (
                  <>
                    <div className="mt-2 h-1 w-full bg-gray-200 rounded-full">
                      <div
                        className="h-1 bg-teal-500 rounded-full"
                        style={{
                          width: `${Math.min((status.current_generation / user.solar_capacity) * 100, 100) || 0}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-right mt-1">
                      {Math.min(Math.round((status.current_generation / user.solar_capacity) * 100), 100) || 0}% of
                      capacity
                    </p>
                  </>
                )}
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
                <p className="text-2xl font-bold">{calculateRealTimeConsumption().toFixed(2)} kW</p>
                <p className="text-sm text-gray-500">
                  {Object.values(applianceStatus).filter((status) => status).length} active appliances
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {appliances
                    .filter((a) => applianceStatus[a.id])
                    .map((appliance) => (
                      <span key={appliance.id} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                        {appliance.name}
                      </span>
                    ))}
                  {!appliances.some((a) => applianceStatus[a.id]) && (
                    <span className="text-xs text-gray-500">No active appliances</span>
                  )}
                </div>
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
                <div className="mt-2 w-full bg-gray-200 rounded-full h-4 relative">
                  <div
                    className={`h-4 rounded-full ${
                      status.battery_status && status.battery_status.percentage > 70
                        ? "bg-green-500"
                        : status.battery_status && status.battery_status.percentage > 30
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${status.battery_status ? status.battery_status.percentage : 0}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    {status.battery_status ? status.battery_status.percentage.toFixed(1) : 0}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Appliance Controls */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaPlug className="mr-2" />
                Quick Appliance Controls
              </CardTitle>
              <CardDescription>Turn appliances on/off to manage energy consumption</CardDescription>
            </CardHeader>
            <CardContent>
              {appliancesLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : appliances.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>No appliances configured</p>
                  <Button onClick={() => setActiveTab("appliances")} variant="outline" className="mt-2">
                    Configure Appliances
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {appliances.map((appliance) => (
                    <div
                      key={appliance.id}
                      className={`p-4 rounded-lg border ${applianceStatus[appliance.id] ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <p className="font-medium mb-1">{appliance.name}</p>
                        <p className="text-xs text-gray-500 mb-2">{appliance.power_consumption}W</p>
                        <Button
                          variant={applianceStatus[appliance.id] ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            toggleApplianceStatus(appliance.id, appliance.name, applianceStatus[appliance.id])
                          }
                          className={`${applianceStatus[appliance.id] ? "bg-green-600 hover:bg-green-700" : "text-red-600 border-red-200 hover:bg-red-50"}`}
                        >
                          <FaPowerOff className="mr-1" />
                          {applianceStatus[appliance.id] ? "ON" : "OFF"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Period Selector */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant={selectedPeriod === "today" ? "default" : "outline"}
              onClick={() => setSelectedPeriod("today")}
              className="flex items-center"
            >
              <FaCalendarDay className="mr-2" />
              Today
            </Button>
            <Button
              variant={selectedPeriod === "week" ? "default" : "outline"}
              onClick={() => setSelectedPeriod("week")}
              className="flex items-center"
            >
              <FaCalendarWeek className="mr-2" />
              This Week
            </Button>
            <Button
              variant={selectedPeriod === "month" ? "default" : "outline"}
              onClick={() => setSelectedPeriod("month")}
              className="flex items-center"
            >
              <FaCalendarAlt className="mr-2" />
              This Month
            </Button>
          </div>

          {/* Daily Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaChartLine className="mr-2" />
                Energy Overview
              </CardTitle>
              <CardDescription>
                {selectedPeriod === "today"
                  ? "Today's energy metrics"
                  : selectedPeriod === "week"
                    ? "This week's energy metrics"
                    : "This month's energy metrics"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="font-semibold">Total Generation</p>
                  <p className="text-xl">
                    {energyData.generation.reduce((sum, item) => sum + item.amount, 0).toFixed(2)} kWh
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Total Consumption</p>
                  <p className="text-xl">
                    {energyData.consumption.reduce((sum, item) => sum + item.amount, 0).toFixed(2)} kWh
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Energy Balance</p>
                  <p className={`text-xl ${energyBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {energyBalance.toFixed(2)} kW
                  </p>
                </div>
              </div>

              {/* Energy Chart */}
              {chartData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ background: "white", border: "1px solid #f0f0f0", borderRadius: "8px" }}
                        formatter={(value) => [`${value.toFixed(2)} kWh`, ""]}
                        labelFormatter={(value) => {
                          const date = new Date(value)
                          return date.toLocaleString()
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 10 }} />
                      <Area
                        type="monotone"
                        dataKey="generation"
                        stroke="#10b981"
                        fill="#10b98133"
                        strokeWidth={2}
                        activeDot={{ r: 5 }}
                        name="Generation"
                      />
                      <Area
                        type="monotone"
                        dataKey="consumption"
                        stroke="#f97316"
                        fill="#f9731633"
                        strokeWidth={2}
                        activeDot={{ r: 5 }}
                        name="Consumption"
                      />
                      <Line
                        type="monotone"
                        dataKey="net"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        name="Net Energy"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center h-[300px] bg-gray-50 rounded-md">
                  <p className="text-gray-500">No energy data available. Run a simulation to generate data.</p>
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
                  <div className="mb-4">
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

                  {dashboard.recent_transactions && dashboard.recent_transactions.length > 0 ? (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Recent Energy Transactions</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="space-y-2">
                          {dashboard.recent_transactions.map((transaction, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="flex items-center">
                                <FaExchangeAlt
                                  className={`${transaction.type === "export" ? "text-green-500" : "text-orange-500"} mr-2`}
                                />
                                <span>{transaction.type === "export" ? "Exported to Grid" : "Imported from Grid"}</span>
                              </span>
                              <div>
                                <span className="font-medium">{transaction.amount} kWh</span>
                                <span className="text-xs text-gray-500 ml-2">{transaction.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Recent Energy Transactions</h4>
                      <div className="bg-gray-50 rounded-lg p-3 text-center text-gray-500">No recent transactions</div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-semibold mb-2">Trading Recommendation</p>
                  <div
                    className={`p-4 rounded-lg mb-4 ${energyBalance >= 0 ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}
                  >
                    {energyBalance >= 0 ? (
                      <div className="flex items-start">
                        <FaExchangeAlt className="text-green-600 mt-1 mr-2" />
                        <div>
                          <p className="text-green-600 font-medium">Excess Energy Available</p>
                          <p className="text-sm mt-1">
                            You have {energyBalance.toFixed(2)} kW excess energy. Consider selling to the grid or
                            neighbors.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <FaExchangeAlt className="text-orange-600 mt-1 mr-2" />
                        <div>
                          <p className="text-orange-600 font-medium">Energy Deficit</p>
                          <p className="text-sm mt-1">
                            You have an energy deficit of {Math.abs(energyBalance).toFixed(2)} kW. Consider purchasing
                            from the grid or optimizing consumption.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="font-semibold mb-2">Current Energy Prices</p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Grid Purchase Price:</span>
                        <span className="font-medium">${dashboard.energy_prices?.purchase || "0.12"}/kWh</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Grid Sell Price:</span>
                        <span className="font-medium">${dashboard.energy_prices?.sell || "0.08"}/kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">P2P Market Price:</span>
                        <span className="font-medium">${dashboard.energy_prices?.p2p || "0.10"}/kWh</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700">View Trading Platform</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {energyData.consumption.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FaBolt className="mr-2" />
                    Consumption by Time of Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={energyData.consumption.map((item) => ({
                          hour: new Date(item.timestamp).getHours(),
                          value: item.amount,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={(hour) => `${hour}:00`} />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${value.toFixed(2)} kWh`, "Energy Usage"]}
                          labelFormatter={(hour) => `Time: ${hour}:00`}
                        />
                        <Bar dataKey="value" fill="#f97316" name="Energy Usage" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FaBolt className="mr-2" />
                    Consumption by Time of Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center items-center h-[300px] bg-gray-50 rounded-md">
                    <p className="text-gray-500">No hourly consumption data available.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {appliances && appliances.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FaPlug className="mr-2" />
                    Appliance Consumption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={appliances.map((app) => ({
                            name: app.name,
                            value: app.daily_energy || (app.power_consumption * (app.daily_usage_hours || 2)) / 1000,
                            isActive: applianceStatus[app.id],
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {appliances.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                applianceStatus[entry.id]
                                  ? ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"][index % 6]
                                  : ["#ccc", "#ddd", "#eee", "#f5f5f5", "#e0e0e0", "#d0d0d0"][index % 6]
                              }
                              stroke={applianceStatus[entry.id] ? "#fff" : "#ccc"}
                              strokeWidth={applianceStatus[entry.id] ? 2 : 1}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toFixed(2)} kWh`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FaPlug className="mr-2" />
                    Appliance Consumption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center items-center h-[300px] bg-gray-50 rounded-md">
                    <p className="text-gray-500">
                      No appliance data available. Add appliances to see consumption breakdown.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="appliances">
          <ApplianceManager initialAppliances={appliances} />
        </TabsContent>

        <TabsContent value="chat">
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="p-4 border-b flex items-center">
              <FaComments className="text-teal-600 mr-2" />
              <h3 className="font-medium">Energy Smart Assistant</h3>
            </div>

            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.sender === "user" ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p>{msg.message}</p>
                    <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask about your energy usage or for tips..."
                  className="flex-1 rounded-l-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-r-lg hover:bg-teal-700">
                  Send
                </button>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <FaBell className="mr-2" />
                Notifications
              </CardTitle>
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg ${notification.read ? "bg-gray-50" : "bg-teal-50 border-l-4 border-teal-500"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <FaBell className={`mt-1 mr-2 ${notification.read ? "text-gray-400" : "text-teal-500"}`} />
                          <div>
                            <p className={notification.read ? "text-gray-700" : "text-gray-900"}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                        {!notification.read && <div className="w-2 h-2 bg-teal-500 rounded-full"></div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-40">
                  <p className="text-gray-500">No notifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default HouseholdDashboard

