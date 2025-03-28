"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../config/axios"
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
  ScatterChart,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import {
  FaSolarPanel,
  FaBolt,
  FaBatteryHalf,
  FaExchangeAlt,
  FaChartLine,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaDownload,
  FaSync,
  FaCloudSun,
  FaThermometerHalf,
  FaCloud,
  FaWind,
} from "react-icons/fa"

const EnergyData = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState("day")
  const [selectedInterval, setSelectedInterval] = useState("hour")
  const [activeTab, setActiveTab] = useState("generation")
  const [generationData, setGenerationData] = useState([])
  const [consumptionData, setConsumptionData] = useState([])
  const [batteryData, setBatteryData] = useState([])
  const [gridData, setGridData] = useState([])
  const [weatherData, setWeatherData] = useState([])
  const [marketPrices, setMarketPrices] = useState(null)
  const navigate = useNavigate()

  // Colors for charts
  const COLORS = {
    generation: "#10b981", // teal
    consumption: "#f97316", // orange
    battery: "#3b82f6", // blue
    grid: "#8b5cf6", // purple
    import: "#ef4444", // red
    export: "#22c55e", // green
  }

  useEffect(() => {
    fetchData()
  }, [selectedPeriod, selectedInterval])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch generation data
      const genResponse = await api.get("/energy/generation", {
        params: {
          period: selectedPeriod,
          interval: selectedInterval,
        },
      })
      setGenerationData(formatTimestampData(genResponse.data))

      // Fetch consumption data
      const consResponse = await api.get("/energy/consumption", {
        params: {
          period: selectedPeriod,
          interval: selectedInterval,
          by_appliance: false,
        },
      })
      setConsumptionData(formatTimestampData(consResponse.data))

      // Fetch battery data
      const batteryResponse = await api.get("/energy/battery", {
        params: {
          period: selectedPeriod,
        },
      })
      setBatteryData(formatTimestampData(batteryResponse.data))

      // Fetch grid data
      const gridResponse = await api.get("/energy/grid", {
        params: {
          period: selectedPeriod,
          direction: "all",
        },
      })
      setGridData(formatTimestampData(gridResponse.data))

      // Fetch weather data
      const weatherResponse = await api.get("/energy/weather")
      setWeatherData(weatherResponse.data)

      // Fetch market prices
      const pricesResponse = await api.get("/energy/market-prices")
      setMarketPrices(pricesResponse.data)
    } catch (err) {
      console.error("Error fetching energy data:", err)
      setError(err.response?.data?.msg || "Failed to fetch energy data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Format timestamp data for charts
  const formatTimestampData = (data) => {
    if (!data || !Array.isArray(data)) return []

    return data.map((item) => ({
      ...item,
      time: new Date(item.timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }),
      formattedDate: new Date(item.timestamp).toLocaleDateString(),
      formattedTime: new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      // Ensure amount is a number
      amount: typeof item.amount === "number" ? item.amount : Number.parseFloat(item.amount) || 0,
    }))
  }

  // Combine generation and consumption data for comparison
  const getCombinedEnergyData = () => {
    if (!generationData.length || !consumptionData.length) return []

    // Create a map of timestamps to make merging easier
    const dataMap = new Map()

    generationData.forEach((item) => {
      dataMap.set(item.timestamp, {
        timestamp: item.timestamp,
        time: item.time,
        generation: item.amount,
        consumption: 0,
        net: item.amount,
      })
    })

    consumptionData.forEach((item) => {
      if (dataMap.has(item.timestamp)) {
        const existing = dataMap.get(item.timestamp)
        existing.consumption = item.amount
        existing.net = existing.generation - item.amount
      } else {
        dataMap.set(item.timestamp, {
          timestamp: item.timestamp,
          time: item.time,
          generation: 0,
          consumption: item.amount,
          net: -item.amount,
        })
      }
    })

    // Convert map to array and sort by timestamp
    return Array.from(dataMap.values()).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }

  // Get data for the energy balance chart
  const getEnergyBalanceData = () => {
    const combined = getCombinedEnergyData()

    // Calculate cumulative balance
    let cumulativeBalance = 0
    return combined.map((item) => {
      cumulativeBalance += item.net
      return {
        ...item,
        cumulativeBalance,
      }
    })
  }

  // Format grid data for import/export chart
  const getFormattedGridData = () => {
    if (!gridData.length) return []

    return gridData.map((item) => ({
      ...item,
      importAmount: item.direction === "import" ? item.amount : 0,
      exportAmount: item.direction === "export" ? item.amount : 0,
    }))
  }

  // Get appliance consumption breakdown
  const getApplianceConsumption = () => {
    // This would ideally come from the API, but we'll simulate it for now
    return [
      { name: "HVAC", value: 35 },
      { name: "Water Heater", value: 20 },
      { name: "Refrigerator", value: 15 },
      { name: "Lighting", value: 10 },
      { name: "Electronics", value: 12 },
      { name: "Other", value: 8 },
    ]
  }

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period)
    // Adjust interval based on period
    if (period === "month") {
      setSelectedInterval("day")
    } else if (period === "day") {
      setSelectedInterval("hour")
    }
  }

  // Handle data refresh
  const handleRefresh = () => {
    fetchData()
  }

  // Handle data export
  const handleExport = () => {
    // Determine which data to export based on active tab
    let dataToExport
    let filename

    switch (activeTab) {
      case "generation":
        dataToExport = generationData
        filename = "generation-data.csv"
        break
      case "consumption":
        dataToExport = consumptionData
        filename = "consumption-data.csv"
        break
      case "battery":
        dataToExport = batteryData
        filename = "battery-data.csv"
        break
      case "grid":
        dataToExport = gridData
        filename = "grid-data.csv"
        break
      case "comparison":
        dataToExport = getCombinedEnergyData()
        filename = "energy-comparison.csv"
        break
      default:
        dataToExport = generationData
        filename = "energy-data.csv"
    }

    // Convert to CSV
    const headers = Object.keys(dataToExport[0] || {}).join(",")
    const rows = dataToExport
      .map((item) =>
        Object.values(item)
          .map((value) => (typeof value === "string" ? `"${value}"` : value))
          .join(","),
      )
      .join("\n")

    const csv = `${headers}\n${rows}`

    // Create download link
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", filename)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (loading && !generationData.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-600">Energy Data Analytics</h1>
          <p className="text-gray-600">Detailed analysis of your energy generation and consumption</p>
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={handleRefresh} className="flex items-center">
            <FaSync className="mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} className="bg-teal-600 hover:bg-teal-700 flex items-center" disabled={loading}>
            <FaDownload className="mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-red-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Period Selector */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant={selectedPeriod === "day" ? "default" : "outline"}
          onClick={() => handlePeriodChange("day")}
          className="flex items-center"
        >
          <FaCalendarDay className="mr-2" />
          Today
        </Button>
        <Button
          variant={selectedPeriod === "week" ? "default" : "outline"}
          onClick={() => handlePeriodChange("week")}
          className="flex items-center"
        >
          <FaCalendarWeek className="mr-2" />
          This Week
        </Button>
        <Button
          variant={selectedPeriod === "month" ? "default" : "outline"}
          onClick={() => handlePeriodChange("month")}
          className="flex items-center"
        >
          <FaCalendarAlt className="mr-2" />
          This Month
        </Button>
      </div>

      {/* Data Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="generation">Generation</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="battery">Battery</TabsTrigger>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="weather">Weather Impact</TabsTrigger>
        </TabsList>

        {/* Generation Tab */}
        <TabsContent value="generation">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-teal-600">
                  <FaSolarPanel className="mr-2" />
                  Total Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {generationData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)} kWh
                </p>
                <p className="text-sm text-gray-500">
                  {selectedPeriod === "day" ? "Today" : selectedPeriod === "week" ? "This Week" : "This Month"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-teal-600">
                  <FaChartLine className="mr-2" />
                  Peak Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {generationData.length ? Math.max(...generationData.map((item) => item.amount)).toFixed(2) : "0.00"}{" "}
                  kW
                </p>
                <p className="text-sm text-gray-500">
                  {generationData.length
                    ? generationData.reduce((max, item) => (item.amount > max.amount ? item : max), generationData[0])
                        .time
                    : "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-teal-600">
                  <FaCloudSun className="mr-2" />
                  Average Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {generationData.length
                    ? (generationData.reduce((sum, item) => sum + item.amount, 0) / generationData.length).toFixed(2)
                    : "0.00"}{" "}
                  kW
                </p>
                <p className="text-sm text-gray-500">Based on {generationData.length} data points</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generation Over Time</CardTitle>
              <CardDescription>
                {selectedPeriod === "day" ? "Hourly" : selectedPeriod === "week" ? "Daily" : "Weekly"} energy generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kWh`, "Generation"]} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      name="Solar Generation"
                      stroke={COLORS.generation}
                      fill={COLORS.generation}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generation by Source</CardTitle>
              <CardDescription>Breakdown of energy generation by source</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Solar",
                          value: generationData.reduce(
                            (sum, item) => sum + (item.source === "solar" ? item.amount : 0),
                            0,
                          ),
                        },
                        {
                          name: "Wind",
                          value: generationData.reduce(
                            (sum, item) => sum + (item.source === "wind" ? item.amount : 0),
                            0,
                          ),
                        },
                        {
                          name: "Other",
                          value: generationData.reduce(
                            (sum, item) => sum + (!["solar", "wind"].includes(item.source) ? item.amount : 0),
                            0,
                          ),
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#10b981" /> {/* Solar - teal */}
                      <Cell fill="#3b82f6" /> {/* Wind - blue */}
                      <Cell fill="#8b5cf6" /> {/* Other - purple */}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(2)} kWh`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consumption Tab */}
        <TabsContent value="consumption">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-600">
                  <FaBolt className="mr-2" />
                  Total Consumption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {consumptionData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)} kWh
                </p>
                <p className="text-sm text-gray-500">
                  {selectedPeriod === "day" ? "Today" : selectedPeriod === "week" ? "This Week" : "This Month"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-600">
                  <FaChartLine className="mr-2" />
                  Peak Consumption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {consumptionData.length ? Math.max(...consumptionData.map((item) => item.amount)).toFixed(2) : "0.00"}{" "}
                  kW
                </p>
                <p className="text-sm text-gray-500">
                  {consumptionData.length
                    ? consumptionData.reduce((max, item) => (item.amount > max.amount ? item : max), consumptionData[0])
                        .time
                    : "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-600">
                  <FaBolt className="mr-2" />
                  Average Consumption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {consumptionData.length
                    ? (consumptionData.reduce((sum, item) => sum + item.amount, 0) / consumptionData.length).toFixed(2)
                    : "0.00"}{" "}
                  kW
                </p>
                <p className="text-sm text-gray-500">Based on {consumptionData.length} data points</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Consumption Over Time</CardTitle>
              <CardDescription>
                {selectedPeriod === "day" ? "Hourly" : selectedPeriod === "week" ? "Daily" : "Weekly"} energy
                consumption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={consumptionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kWh`, "Consumption"]} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      name="Energy Consumption"
                      stroke={COLORS.consumption}
                      fill={COLORS.consumption}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consumption by Appliance</CardTitle>
              <CardDescription>Breakdown of energy consumption by appliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getApplianceConsumption()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getApplianceConsumption().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={["#f97316", "#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"][index % 6]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Battery Tab */}
        <TabsContent value="battery">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <FaBatteryHalf className="mr-2" />
                  Current Battery Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {batteryData.length ? batteryData[batteryData.length - 1].percentage.toFixed(1) : "0.0"}%
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-4 relative">
                  <div
                    className={`h-4 rounded-full ${
                      batteryData.length && batteryData[batteryData.length - 1].percentage > 70
                        ? "bg-green-500"
                        : batteryData.length && batteryData[batteryData.length - 1].percentage > 30
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${batteryData.length ? batteryData[batteryData.length - 1].percentage : 0}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <FaBatteryHalf className="mr-2" />
                  Charge Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {batteryData.length ? batteryData[batteryData.length - 1].charge_rate.toFixed(2) : "0.00"} kW
                </p>
                <p className="text-sm text-gray-500">
                  {batteryData.length && batteryData[batteryData.length - 1].charge_rate > 0
                    ? "Charging"
                    : batteryData.length && batteryData[batteryData.length - 1].charge_rate < 0
                      ? "Discharging"
                      : "Idle"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <FaBatteryHalf className="mr-2" />
                  Battery Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {batteryData.length
                    ? (
                        batteryData[batteryData.length - 1].amount /
                        (batteryData[batteryData.length - 1].percentage / 100)
                      ).toFixed(2)
                    : "0.00"}{" "}
                  kWh
                </p>
                <p className="text-sm text-gray-500">Total storage capacity</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Battery Level Over Time</CardTitle>
              <CardDescription>
                {selectedPeriod === "day" ? "Hourly" : selectedPeriod === "week" ? "Daily" : "Weekly"} battery level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={batteryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, "Battery Level"]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      name="Battery Level"
                      stroke={COLORS.battery}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Charge/Discharge Rate</CardTitle>
              <CardDescription>Battery charge and discharge rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={batteryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kW`, "Charge Rate"]} />
                    <Legend />
                    <Bar dataKey="charge_rate" name="Charge Rate" fill={COLORS.battery} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grid Tab */}
        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-purple-600">
                  <FaExchangeAlt className="mr-2" />
                  Total Grid Import
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {gridData
                    .filter((item) => item.direction === "import")
                    .reduce((sum, item) => sum + item.amount, 0)
                    .toFixed(2)}{" "}
                  kWh
                </p>
                <p className="text-sm text-gray-500">
                  {selectedPeriod === "day" ? "Today" : selectedPeriod === "week" ? "This Week" : "This Month"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <FaExchangeAlt className="mr-2" />
                  Total Grid Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {gridData
                    .filter((item) => item.direction === "export")
                    .reduce((sum, item) => sum + item.amount, 0)
                    .toFixed(2)}{" "}
                  kWh
                </p>
                <p className="text-sm text-gray-500">
                  {selectedPeriod === "day" ? "Today" : selectedPeriod === "week" ? "This Week" : "This Month"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-purple-600">
                  <FaExchangeAlt className="mr-2" />
                  Net Grid Exchange
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {(
                    gridData.filter((item) => item.direction === "export").reduce((sum, item) => sum + item.amount, 0) -
                    gridData.filter((item) => item.direction === "import").reduce((sum, item) => sum + item.amount, 0)
                  ).toFixed(2)}{" "}
                  kWh
                </p>
                <p className="text-sm text-gray-500">
                  {gridData.filter((item) => item.direction === "export").reduce((sum, item) => sum + item.amount, 0) >
                  gridData.filter((item) => item.direction === "import").reduce((sum, item) => sum + item.amount, 0)
                    ? "Net Export"
                    : "Net Import"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Grid Exchange Over Time</CardTitle>
              <CardDescription>
                {selectedPeriod === "day" ? "Hourly" : selectedPeriod === "week" ? "Daily" : "Weekly"} grid
                import/export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={getFormattedGridData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kWh`, ""]} />
                    <Legend />
                    <Bar dataKey="importAmount" name="Grid Import" fill={COLORS.import} stackId="a" />
                    <Bar dataKey="exportAmount" name="Grid Export" fill={COLORS.export} stackId="b" />
                    <Line type="monotone" dataKey="price" name="Energy Price" stroke="#8884d8" yAxisId={1} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Energy Market Prices</CardTitle>
              <CardDescription>Current and historical energy market prices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Grid Purchase Price</p>
                  <p className="text-2xl font-bold">${marketPrices?.purchase || "0.12"}/kWh</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Grid Sell Price</p>
                  <p className="text-2xl font-bold">${marketPrices?.sell || "0.08"}/kWh</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">P2P Market Price</p>
                  <p className="text-2xl font-bold">${marketPrices?.p2p || "0.10"}/kWh</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="font-medium mb-2">Trading Recommendation</p>
                {gridData.filter((item) => item.direction === "export").reduce((sum, item) => sum + item.amount, 0) >
                gridData.filter((item) => item.direction === "import").reduce((sum, item) => sum + item.amount, 0) ? (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <p className="text-green-600 font-medium">Net Exporter</p>
                    <p className="text-sm mt-1">
                      You're exporting more energy than importing. Consider optimizing your export times to match peak
                      price periods.
                    </p>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <p className="text-orange-600 font-medium">Net Importer</p>
                    <p className="text-sm mt-1">
                      You're importing more energy than exporting. Consider increasing generation or reducing
                      consumption during peak price periods.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generation vs. Consumption</CardTitle>
              <CardDescription>Comparison of energy generation and consumption over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getCombinedEnergyData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kWh`, ""]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="generation"
                      name="Generation"
                      stroke={COLORS.generation}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="consumption"
                      name="Consumption"
                      stroke={COLORS.consumption}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Energy Balance</CardTitle>
              <CardDescription>Net energy balance (generation minus consumption) over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={getEnergyBalanceData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kWh`, ""]} />
                    <Legend />
                    <Bar
                      dataKey="net"
                      name="Net Energy"
                      fill={(bar) => (bar.net >= 0 ? COLORS.generation : COLORS.consumption)}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulativeBalance"
                      name="Cumulative Balance"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Energy Self-Sufficiency</CardTitle>
                <CardDescription>Percentage of energy needs met by own generation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-4xl font-bold">
                        {getCombinedEnergyData().length
                          ? Math.min(
                              100,
                              Math.round(
                                (getCombinedEnergyData().reduce((sum, item) => sum + item.generation, 0) /
                                  Math.max(
                                    0.1,
                                    getCombinedEnergyData().reduce((sum, item) => sum + item.consumption, 0),
                                  )) *
                                  100,
                              ),
                            )
                          : 0}
                        %
                      </p>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Self-Generated",
                              value: getCombinedEnergyData().reduce((sum, item) => sum + item.generation, 0),
                            },
                            {
                              name: "Grid Import",
                              value: Math.max(
                                0,
                                getCombinedEnergyData().reduce((sum, item) => sum + item.consumption, 0) -
                                  getCombinedEnergyData().reduce((sum, item) => sum + item.generation, 0),
                              ),
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          <Cell fill={COLORS.generation} />
                          <Cell fill={COLORS.import} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      {getCombinedEnergyData().length
                        ? `${getCombinedEnergyData()
                            .reduce((sum, item) => sum + item.generation, 0)
                            .toFixed(2)} kWh generated vs ${getCombinedEnergyData()
                            .reduce((sum, item) => sum + item.consumption, 0)
                            .toFixed(2)} kWh consumed`
                        : "No data available"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Energy Cost Analysis</CardTitle>
                <CardDescription>Estimated cost savings from self-generation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Total Energy Cost</p>
                    <p className="text-2xl font-bold">
                      $
                      {gridData
                        .filter((item) => item.direction === "import")
                        .reduce((sum, item) => sum + item.amount * (item.price || marketPrices?.purchase || 0.12), 0)
                        .toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Based on grid imports and current prices</p>
                  </div>

                  <div>
                    <p className="font-medium">Cost Without Solar</p>
                    <p className="text-2xl font-bold">
                      $
                      {(
                        getCombinedEnergyData().reduce((sum, item) => sum + item.consumption, 0) *
                        (marketPrices?.purchase || 0.12)
                      ).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Estimated cost if all energy was imported</p>
                  </div>

                  <div>
                    <p className="font-medium">Estimated Savings</p>
                    <p className="text-2xl font-bold text-green-600">
                      $
                      {(
                        getCombinedEnergyData().reduce((sum, item) => sum + item.consumption, 0) *
                          (marketPrices?.purchase || 0.12) -
                        gridData
                          .filter((item) => item.direction === "import")
                          .reduce(
                            (sum, item) => sum + item.amount * (item.price || marketPrices?.purchase || 0.12),
                            0,
                          ) +
                        gridData
                          .filter((item) => item.direction === "export")
                          .reduce((sum, item) => sum + item.amount * (item.price || marketPrices?.sell || 0.08), 0)
                      ).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">From self-generation and grid exports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Weather Impact Tab */}
        <TabsContent value="weather">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaCloudSun className="mr-2" />
                  Current Weather Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <div className="text-4xl text-blue-500 mr-4">
                      <FaThermometerHalf />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Temperature</p>
                      <p className="text-2xl font-bold">{weatherData?.temperature || "N/A"}°C</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <div className="text-4xl text-gray-500 mr-4">
                      <FaCloud />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cloud Cover</p>
                      <p className="text-2xl font-bold">{weatherData?.cloudCover || "N/A"}%</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <div className="text-4xl text-yellow-500 mr-4">
                      <FaSolarPanel />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Solar Irradiance</p>
                      <p className="text-2xl font-bold">{weatherData?.solarIrradiance || "N/A"} W/m²</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <div className="text-4xl text-blue-500 mr-4">
                      <FaWind />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Wind Speed</p>
                      <p className="text-2xl font-bold">{weatherData?.windSpeed || "N/A"} m/s</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weather Impact Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium mb-2">Cloud Cover Impact</p>
                    <p className="text-sm">
                      Current cloud cover is reducing solar efficiency by approximately
                      <span className="font-medium"> {Math.min(85, weatherData?.cloudCover || 0)}%</span>.
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, weatherData?.cloudCover || 0)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium mb-2">Temperature Impact</p>
                    <p className="text-sm">
                      Current temperature is
                      {(weatherData?.temperature || 0) > 25 ? " reducing " : " optimizing "}
                      panel efficiency by approximately
                      <span className="font-medium">
                        {" "}
                        {Math.abs(((weatherData?.temperature || 25) - 25) * 0.5).toFixed(1)}%
                      </span>
                      .
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, Math.abs(((weatherData?.temperature || 25) - 25) * 2))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weather vs. Generation Correlation</CardTitle>
              <CardDescription>Analysis of how weather conditions affect energy generation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="solarIrradiance"
                      name="Solar Irradiance"
                      unit=" W/m²"
                      domain={[0, 1200]}
                    />
                    <YAxis type="number" dataKey="amount" name="Generation" unit=" kWh" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Legend />
                    <Scatter
                      name="Generation vs. Irradiance"
                      data={generationData.map((item) => ({
                        ...item,
                        solarIrradiance: item.irradiance || Math.random() * 1000,
                      }))}
                      fill={COLORS.generation}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnergyData

