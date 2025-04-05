"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { FaExclamationTriangle, FaBolt, FaSolarPanel, FaChartLine, FaCalendarAlt, FaDownload } from "react-icons/fa"
import EnergyService from "../services/energy"
import ApplianceService from "../services/appliance"
import TradingService from "../services/trading"

const Analytics = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState("day")
  const [activeTab, setActiveTab] = useState("consumption")
  // Initialize energyData with empty arrays
  const [energyData, setEnergyData] = useState({
    generation: [],
    consumption: [],
    battery: [],
    grid: [],
  })
  const [applianceUsage, setApplianceUsage] = useState([])
  const [priceData, setPriceData] = useState([])
  const [summaryData, setSummaryData] = useState(null)
  const { user } = useAuth()

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      // Fetch energy generation data
      const generationResponse = await EnergyService.getGenerationData(selectedPeriod)

      // Fetch energy consumption data
      const consumptionResponse = await EnergyService.getConsumptionData(selectedPeriod)

      // Fetch battery data
      const batteryResponse = await EnergyService.getBatteryData(selectedPeriod)

      // Fetch grid data
      const gridResponse = await EnergyService.getGridData(selectedPeriod)

      // Fetch appliance usage summary
      const applianceUsageResponse = await ApplianceService.getApplianceUsageSummary(selectedPeriod)

      // Fetch price data
      const priceResponse = await TradingService.getPriceForecast()

      // Fetch energy overview for summary data
      const overviewResponse = await EnergyService.getEnergyOverview(selectedPeriod)

      // Update state with fetched data, ensuring arrays are properly initialized
      setEnergyData({
        generation: Array.isArray(generationResponse.data) ? generationResponse.data : [],
        consumption: Array.isArray(consumptionResponse.data) ? consumptionResponse.data : [],
        battery: Array.isArray(batteryResponse.data) ? batteryResponse.data : [],
        grid: Array.isArray(gridResponse.data) ? gridResponse.data : [],
      })

      if (applianceUsageResponse.success && Array.isArray(applianceUsageResponse.data.appliances)) {
        setApplianceUsage(applianceUsageResponse.data.appliances)
      } else {
        setApplianceUsage([])
      }

      if (priceResponse.success && Array.isArray(priceResponse.data.forecast)) {
        setPriceData(priceResponse.data.forecast)
      } else {
        setPriceData([])
      }

      if (overviewResponse.success) {
        setSummaryData(overviewResponse.data)
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching analytics data:", err)
      setError(err.response?.data?.msg || "Failed to fetch analytics data")
      
      // Ensure data is initialized as empty arrays even on error
      setEnergyData({
        generation: [],
        consumption: [],
        battery: [],
        grid: [],
      })
      setApplianceUsage([])
      setPriceData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedPeriod])

  // Format timestamp for charts
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format date for charts
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp)
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  // Prepare consumption data for charts
  const prepareConsumptionData = () => {
    if (!Array.isArray(energyData.consumption)) return [];
    
    return energyData.consumption.map((item) => ({
      time: formatTimestamp(item.timestamp),
      date: formatDate(item.timestamp),
      value: item.amount || 0,
      timestamp: item.timestamp,
    }))
  }

  // Prepare generation data for charts
  const prepareGenerationData = () => {
    if (!Array.isArray(energyData.generation)) return [];
    
    return energyData.generation.map((item) => ({
      time: formatTimestamp(item.timestamp),
      date: formatDate(item.timestamp),
      value: item.amount || 0,
      source: item.source || "solar",
      timestamp: item.timestamp,
    }))
  }

  // Prepare battery data for charts
  const prepareBatteryData = () => {
    if (!Array.isArray(energyData.battery)) return [];
    
    return energyData.battery.map((item) => ({
      time: formatTimestamp(item.timestamp),
      date: formatDate(item.timestamp),
      level: item.percentage || 0,
      charge: item.charge_rate || 0,
      timestamp: item.timestamp,
    }))
  }

  // Prepare grid data for charts
  const prepareGridData = () => {
    // Ensure grid data is an array before mapping
    if (!Array.isArray(energyData.grid)) return [];
  
    return energyData.grid.map((item) => ({
      time: formatTimestamp(item.timestamp),
      date: formatDate(item.timestamp),
      import: item.direction === "import" ? (item.amount || 0) : 0,
      export: item.direction === "export" ? (item.amount || 0) : 0,
      timestamp: item.timestamp,
    }))
  }

  // Prepare appliance usage data for pie chart
  const prepareApplianceUsageData = () => {
    if (!Array.isArray(applianceUsage)) return [];
    
    return applianceUsage.map((appliance) => ({
      name: appliance.name || "Unknown",
      value: appliance.energy_consumed || 0,
    }))
  }

  // Calculate total consumption
  const calculateTotalConsumption = () => {
    if (!Array.isArray(energyData.consumption)) return "0.00";
    return energyData.consumption.reduce((total, item) => total + (item.amount || 0), 0).toFixed(2)
  }

  // Calculate total generation
  const calculateTotalGeneration = () => {
    if (!Array.isArray(energyData.generation)) return "0.00";
    return energyData.generation.reduce((total, item) => total + (item.amount || 0), 0).toFixed(2)
  }

  // Calculate grid import/export
  const calculateGridUsage = () => {
    // Ensure grid is an array
    const gridData = Array.isArray(energyData.grid) ? energyData.grid : [];
    
    const imports = gridData
      .filter((item) => item && item.direction === "import")
      .reduce((total, item) => total + (item.amount || 0), 0);

    const exports = gridData
      .filter((item) => item && item.direction === "export")
      .reduce((total, item) => total + (item.amount || 0), 0);

    return {
      import: imports.toFixed(2),
      export: exports.toFixed(2),
      net: (exports - imports).toFixed(2),
    };
  }

  // Export data as CSV
  const exportDataAsCSV = (dataType) => {
    let data = []
    let filename = ""
    let headers = ""

    switch (dataType) {
      case "consumption":
        data = Array.isArray(energyData.consumption) ? energyData.consumption : [];
        filename = `energy-consumption-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.csv`
        headers = "Timestamp,Amount (kWh)\n"
        break
      case "generation":
        data = Array.isArray(energyData.generation) ? energyData.generation : [];
        filename = `energy-generation-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.csv`
        headers = "Timestamp,Amount (kWh),Source\n"
        break
      case "battery":
        data = Array.isArray(energyData.battery) ? energyData.battery : [];
        filename = `battery-data-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.csv`
        headers = "Timestamp,Percentage (%),Charge Rate (kW)\n"
        break
      case "grid":
        data = Array.isArray(energyData.grid) ? energyData.grid : [];
        filename = `grid-data-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.csv`
        headers = "Timestamp,Amount (kWh),Direction\n"
        break
      default:
        return
    }

    let csvContent = headers

    data.forEach((item) => {
      if (!item) return; // Skip null or undefined items
      
      let row = ""
      switch (dataType) {
        case "consumption":
          row = `${item.timestamp || ""},${item.amount || 0}\n`
          break
        case "generation":
          row = `${item.timestamp || ""},${item.amount || 0},${item.source || "solar"}\n`
          break
        case "battery":
          row = `${item.timestamp || ""},${item.percentage || 0},${item.charge_rate || 0}\n`
          break
        case "grid":
          row = `${item.timestamp || ""},${item.amount || 0},${item.direction || ""}\n`
          break
      }
      csvContent += row
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading && !energyData.consumption.length && !energyData.generation.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-600">Energy Analytics</h1>
          <p className="text-gray-600">Detailed analysis of your energy usage and production</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <div className="flex items-center bg-white border rounded-md p-1.5 shadow-sm">
            <FaCalendarAlt className="text-teal-600 mr-2 ml-1" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border-none focus:ring-0 text-sm font-medium"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <Button onClick={() => fetchAnalyticsData()} className="bg-teal-600 hover:bg-teal-700">
            Refresh Data
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-blue-100 rounded-full">
                <FaBolt className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Consumption</p>
                <p className="text-2xl font-bold text-blue-700">{calculateTotalConsumption()} kWh</p>
                <p className="text-xs text-gray-500">
                  {selectedPeriod === "day"
                    ? "Today"
                    : selectedPeriod === "week"
                      ? "This Week"
                      : selectedPeriod === "month"
                        ? "This Month"
                        : "This Year"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-yellow-100 rounded-full">
                <FaSolarPanel className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Generation</p>
                <p className="text-2xl font-bold text-yellow-700">{calculateTotalGeneration()} kWh</p>
                <p className="text-xs text-gray-500">
                  {selectedPeriod === "day"
                    ? "Today"
                    : selectedPeriod === "week"
                      ? "This Week"
                      : selectedPeriod === "month"
                        ? "This Month"
                        : "This Year"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-green-100 rounded-full">
                <FaChartLine className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Grid Export</p>
                <p className="text-2xl font-bold text-green-700">{calculateGridUsage().export} kWh</p>
                <p className="text-xs text-gray-500">
                  {selectedPeriod === "day"
                    ? "Today"
                    : selectedPeriod === "week"
                      ? "This Week"
                      : selectedPeriod === "month"
                        ? "This Month"
                        : "This Year"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-red-100 rounded-full">
                <FaChartLine className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Grid Import</p>
                <p className="text-2xl font-bold text-red-700">{calculateGridUsage().import} kWh</p>
                <p className="text-xs text-gray-500">
                  {selectedPeriod === "day"
                    ? "Today"
                    : selectedPeriod === "week"
                      ? "This Week"
                      : selectedPeriod === "month"
                        ? "This Month"
                        : "This Year"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different analytics views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="generation">Generation</TabsTrigger>
          <TabsTrigger value="battery">Battery</TabsTrigger>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="appliances">Appliances</TabsTrigger>
          <TabsTrigger value="prices">Energy Prices</TabsTrigger>
        </TabsList>

        {/* Consumption Tab */}
        <TabsContent value="consumption">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Energy Consumption</CardTitle>
                  <CardDescription>
                    {selectedPeriod === "day"
                      ? "Hourly consumption today"
                      : selectedPeriod === "week"
                        ? "Daily consumption this week"
                        : selectedPeriod === "month"
                          ? "Daily consumption this month"
                          : "Monthly consumption this year"}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportDataAsCSV("consumption")}>
                  <FaDownload className="mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareConsumptionData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={selectedPeriod === "day" ? "time" : "date"} tick={{ fontSize: 12 }} />
                      <YAxis label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft" }} />
                      <Tooltip formatter={(value) => [`${value} kWh`, "Consumption"]} />
                      <Legend />
                      <Bar dataKey="value" name="Consumption" fill="#3182CE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {summaryData && (
              <Card>
                <CardHeader>
                  <CardTitle>Consumption Insights</CardTitle>
                  <CardDescription>Analysis of your energy consumption patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-700 mb-2">Peak Usage Time</h3>
                      <p className="text-lg font-bold">{summaryData.peak_consumption_time || "N/A"}</p>
                      <p className="text-sm text-gray-600">
                        {summaryData.peak_consumption_value
                          ? `${summaryData.peak_consumption_value.toFixed(2)} kWh`
                          : ""}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-700 mb-2">Average Daily Usage</h3>
                      <p className="text-lg font-bold">
                        {summaryData.avg_daily_consumption
                          ? `${summaryData.avg_daily_consumption.toFixed(2)} kWh`
                          : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">{summaryData.consumption_trend || ""}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-700 mb-2">Efficiency Score</h3>
                      <p className="text-lg font-bold">
                        {summaryData.efficiency_score ? `${summaryData.efficiency_score}/10` : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">{summaryData.efficiency_message || ""}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Generation Tab */}
        <TabsContent value="generation">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Energy Generation</CardTitle>
                  <CardDescription>
                    {selectedPeriod === "day"
                      ? "Hourly generation today"
                      : selectedPeriod === "week"
                        ? "Daily generation this week"
                        : selectedPeriod === "month"
                          ? "Daily generation this month"
                          : "Monthly generation this year"}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportDataAsCSV("generation")}>
                  <FaDownload className="mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={prepareGenerationData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={selectedPeriod === "day" ? "time" : "date"} tick={{ fontSize: 12 }} />
                      <YAxis label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft" }} />
                      <Tooltip formatter={(value) => [`${value} kWh`, "Generation"]} />
                      <Legend />
                      <Area type="monotone" dataKey="value" name="Generation" fill="#F6AD55" stroke="#ED8936" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {summaryData && (
              <Card>
                <CardHeader>
                  <CardTitle>Generation Insights</CardTitle>
                  <CardDescription>Analysis of your energy production patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-medium text-yellow-700 mb-2">Peak Generation Time</h3>
                      <p className="text-lg font-bold">{summaryData.peak_generation_time || "N/A"}</p>
                      <p className="text-sm text-gray-600">
                        {summaryData.peak_generation_value ? `${summaryData.peak_generation_value.toFixed(2)} kWh` : ""}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-medium text-yellow-700 mb-2">Average Daily Production</h3>
                      <p className="text-lg font-bold">
                        {summaryData.avg_daily_generation
                          ? `${summaryData.avg_daily_generation.toFixed(2)} kWh`
                          : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">{summaryData.generation_trend || ""}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-medium text-yellow-700 mb-2">Solar Efficiency</h3>
                      <p className="text-lg font-bold">
                        {summaryData.solar_efficiency ? `${summaryData.solar_efficiency.toFixed(1)}%` : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">{summaryData.solar_efficiency_message || ""}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Battery Tab */}
        <TabsContent value="battery">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Battery Performance</CardTitle>
                  <CardDescription>Battery level and charge/discharge rate</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportDataAsCSV("battery")}>
                  <FaDownload className="mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareBatteryData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={selectedPeriod === "day" ? "time" : "date"} tick={{ fontSize: 12 }} />
                      <YAxis
                        yAxisId="left"
                        label={{ value: "Battery Level (%)", angle: -90, position: "insideLeft" }}
                        domain={[0, 100]}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: "Charge Rate (kW)", angle: 90, position: "insideRight" }}
                        domain={[-5, 5]}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="level"
                        name="Battery Level"
                        stroke="#38B2AC"
                        strokeWidth={2}
                        dot={{ r: 1 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="charge"
                        name="Charge Rate"
                        stroke="#805AD5"
                        strokeWidth={2}
                        dot={{ r: 1 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {summaryData && (
              <Card>
                <CardHeader>
                  <CardTitle>Battery Insights</CardTitle>
                  <CardDescription>Analysis of your battery usage patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h3 className="font-medium text-teal-700 mb-2">Charge Cycles</h3>
                      <p className="text-lg font-bold">{summaryData.battery_cycles || "N/A"}</p>
                      <p className="text-sm text-gray-600">
                        {selectedPeriod === "day"
                          ? "Today"
                          : selectedPeriod === "week"
                            ? "This Week"
                            : selectedPeriod === "month"
                              ? "This Month"
                              : "This Year"}
                      </p>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h3 className="font-medium text-teal-700 mb-2">Average Depth of Discharge</h3>
                      <p className="text-lg font-bold">
                        {summaryData.avg_discharge_depth ? `${summaryData.avg_discharge_depth.toFixed(1)}%` : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">{summaryData.battery_health_message || ""}</p>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h3 className="font-medium text-teal-700 mb-2">Self-Consumption Rate</h3>
                      <p className="text-lg font-bold">
                        {summaryData.self_consumption_rate ? `${summaryData.self_consumption_rate.toFixed(1)}%` : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">Energy used directly or stored</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Grid Tab */}
        <TabsContent value="grid">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Grid Interaction</CardTitle>
                  <CardDescription>Energy imported from and exported to the grid</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportDataAsCSV("grid")}>
                  <FaDownload className="mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareGridData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={selectedPeriod === "day" ? "time" : "date"} tick={{ fontSize: 12 }} />
                      <YAxis label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft" }} />
                      <Tooltip formatter={(value) => [`${value} kWh`, ""]} />
                      <Legend />
                      <Bar dataKey="import" name="Grid Import" fill="#F56565" />
                      <Bar dataKey="export" name="Grid Export" fill="#48BB78" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {summaryData && (
              <Card>
                <CardHeader>
                  <CardTitle>Grid Interaction Insights</CardTitle>
                  <CardDescription>Analysis of your energy exchange with the grid</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-medium text-purple-700 mb-2">Grid Independence</h3>
                      <p className="text-lg font-bold">
                        {summaryData.grid_independence ? `${summaryData.grid_independence.toFixed(1)}%` : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">Percentage of energy needs met without grid</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-medium text-purple-700 mb-2">Net Grid Energy</h3>
                      <p className="text-lg font-bold">{calculateGridUsage().net} kWh</p>
                      <p className="text-sm text-gray-600">
                        {Number(calculateGridUsage().net) > 0 ? "Net export to grid" : "Net import from grid"}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-medium text-purple-700 mb-2">Grid Cost Savings</h3>
                      <p className="text-lg font-bold">
                        {summaryData.grid_cost_savings ? `$${summaryData.grid_cost_savings.toFixed(2)}` : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">Estimated savings from self-generation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Appliances Tab */}
        <TabsContent value="appliances">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Appliance Energy Usage</CardTitle>
                <CardDescription>Breakdown of energy consumption by appliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareApplianceUsageData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {prepareApplianceUsageData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toFixed(2)} kWh`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appliance Usage Details</CardTitle>
                <CardDescription>Detailed energy consumption by appliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Appliance</th>
                        <th className="px-4 py-2 text-left">Energy Used</th>
                        <th className="px-4 py-2 text-left">Usage Time</th>
                        <th className="px-4 py-2 text-left">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applianceUsage.length > 0 ? (
                        applianceUsage.map((appliance, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-2">{appliance.name || "Unknown"}</td>
                            <td className="px-4 py-2">{appliance.energy_consumed?.toFixed(2) || "0.00"} kWh</td>
                            <td className="px-4 py-2">{appliance.usage_hours?.toFixed(1) || "0.0"} hours</td>
                            <td className="px-4 py-2">${appliance.estimated_cost?.toFixed(2) || "0.00"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                            No appliance usage data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {summaryData && summaryData.appliance_recommendations && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Appliance Usage Recommendations</CardTitle>
                  <CardDescription>Tips to optimize your appliance energy usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {summaryData.appliance_recommendations.map((recommendation, index) => (
                      <div key={index} className="bg-orange-50 p-4 rounded-lg">
                        <h3 className="font-medium text-orange-700 mb-2">{recommendation.title}</h3>
                        <p className="text-sm text-gray-600">{recommendation.description}</p>
                        <p className="text-xs text-orange-600 mt-2">
                          Potential savings: {recommendation.potential_savings}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Prices Tab */}
        <TabsContent value="prices">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Energy Price Forecast</CardTitle>
                <CardDescription>Predicted energy prices for the next 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                      <YAxis domain={["auto", "auto"]} tickFormatter={(price) => `$${price.toFixed(2)}`} />
                      <Tooltip
                        formatter={(value) => [`$${value.toFixed(2)}`, "Price"]}
                        labelFormatter={(hour) => `Time: ${hour}:00`}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="price" name="Market Price" stroke="#4FD1C5" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="p2p_price" name="P2P Price" stroke="#38B2AC" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {summaryData && (
              <Card>
                <CardHeader>
                  <CardTitle>Price Insights</CardTitle>
                  <CardDescription>Analysis of energy prices and cost-saving opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-700 mb-2">Best Time to Sell</h3>
                      <p className="text-lg font-bold">{summaryData.best_sell_time || "N/A"}</p>
                      <p className="text-sm text-gray-600">
                        {summaryData.best_sell_price ? `$${summaryData.best_sell_price.toFixed(2)}/kWh` : ""}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-700 mb-2">Best Time to Buy</h3>
                      <p className="text-lg font-bold">{summaryData.best_buy_time || "N/A"}</p>
                      <p className="text-sm text-gray-600">
                        {summaryData.best_buy_price ? `$${summaryData.best_buy_price.toFixed(2)}/kWh` : ""}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-700 mb-2">Potential Trading Profit</h3>
                      <p className="text-lg font-bold">
                        {summaryData.potential_trading_profit
                          ? `$${summaryData.potential_trading_profit.toFixed(2)}`
                          : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">Based on current battery level and forecast</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Analytics
