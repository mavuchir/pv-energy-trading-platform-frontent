"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Switch } from "../components/ui/switch"
import { Slider } from "../components/ui/Slider"
import { Label } from "../components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Input } from "../components/ui/Input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts"
import {
  FaExclamationTriangle,
  FaBatteryFull,
  FaChartLine,
  FaBolt,
  FaSolarPanel,
  FaExchangeAlt,
  FaLightbulb,
  FaBrain,
  FaPlug,
} from "react-icons/fa"
import EnergyService from "../services/energy"
import MLService from "../services/ml"

const Optimization = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [batteryData, setBatteryData] = useState(null)
  const [forecastData, setForecastData] = useState([])
  const [demandPrediction, setDemandPrediction] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [appliancePatterns, setAppliancePatterns] = useState([])
  const [batteryMode, setBatteryMode] = useState("smart")
  const [batteryThresholds, setBatteryThresholds] = useState({
    min: 20,
    max: 90,
    gridExport: 80,
    gridImport: 30,
  })
  const [activeTab, setActiveTab] = useState("battery")
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [energyPriorityMode, setEnergyPriorityMode] = useState("balanced")
  const [scheduleActive, setScheduleActive] = useState(true)
  const { user } = useAuth()

  const fetchOptimizationData = async () => {
    try {
      setLoading(true)

      // Fetch battery data
      const batteryResponse = await EnergyService.getBatteryData("day")
      if (batteryResponse.success) {
        setBatteryData({
          current: batteryResponse.data[batteryResponse.data.length - 1] || {
            percentage: 0,
            current_charge: 0,
            charge_rate: 0,
          },
          history: batteryResponse.data,
        })
      }

      // Fetch energy forecast
      const forecastResponse = await EnergyService.getEnergyForecast()
      if (forecastResponse.success) {
        setForecastData(forecastResponse.data.forecast || [])
      }

      // Fetch demand prediction
      const demandResponse = await MLService.getDemandPrediction(24)
      if (demandResponse.success) {
        setDemandPrediction(demandResponse.data.predictions || [])
      }

      // Fetch optimization recommendations
      const recommendationsResponse = await MLService.getEnergyOptimizationRecommendations()
      if (recommendationsResponse.success) {
        setRecommendations(recommendationsResponse.data.recommendations || [])
      }

      // Fetch appliance usage patterns
      const patternsResponse = await MLService.getApplianceUsagePatterns()
      if (patternsResponse.success) {
        setAppliancePatterns(patternsResponse.data.patterns || [])
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching optimization data:", err)
      setError(err.response?.data?.msg || "Failed to fetch optimization data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOptimizationData()
  }, [])

  // Apply optimization settings
  const handleApplySettings = async () => {
    try {
      setLoading(true)
      // This would typically call a backend endpoint to save the settings
      // For now, we'll just simulate a success response
      setTimeout(() => {
        setIsSettingsDialogOpen(false)
        setLoading(false)
      }, 1000)
    } catch (err) {
      console.error("Error updating settings:", err)
      setError("Failed to update settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Apply recommended schedule
  const applyRecommendedSchedule = async (deviceId) => {
    try {
      setLoading(true)
      // This would typically call a backend endpoint to apply the schedule
      // For now, we'll just simulate a success response
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    } catch (err) {
      console.error("Error applying schedule:", err)
      setError("Failed to apply schedule. Please try again.")
    }
  }

  // Format battery data for charts
  const formatBatteryData = () => {
    if (!batteryData?.history || !Array.isArray(batteryData.history)) {
      return []
    }

    return (
      batteryData.history.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        level: item.percentage,
        charge: item.charge_rate,
      })) || []
    )
  }

  // Format forecast data
  const formatForecastData = () => {
    if (!Array.isArray(forecastData)) {
      return []
    }

    return forecastData.map((item) => ({
      time: item.hour + ":00",
      generation: item.solar_generation,
      consumption: item.predicted_consumption,
      net: item.solar_generation - item.predicted_consumption,
    }))
  }

  // Battery status text
  const getBatteryStatusText = () => {
    if (!batteryData?.current) return "Unknown"

    const chargeRate = batteryData.current.charge_rate || 0

    if (chargeRate > 0.2) return "Charging"
    if (chargeRate < -0.2) return "Discharging"
    return "Idle"
  }

  // Calculate optimal battery usage time
  const getOptimalUsageTime = () => {
    // This would typically be calculated based on forecast data
    // For now, we'll return a placeholder
    return {
      charge: "10:00 AM - 2:00 PM",
      discharge: "6:00 PM - 9:00 PM",
    }
  }

  if (loading && !batteryData) {
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
          <h1 className="text-3xl font-bold text-teal-600">Energy Optimization</h1>
          <p className="text-gray-600">AI-powered optimization for your energy system</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button onClick={() => setIsSettingsDialogOpen(true)} variant="outline">
            <FaBrain className="mr-2" />
            Optimization Settings
          </Button>
          <Button onClick={fetchOptimizationData} className="bg-teal-600 hover:bg-teal-700">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-teal-50 to-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-teal-100 rounded-full">
                <FaBatteryFull className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Battery Level</p>
                <p className="text-2xl font-bold text-teal-700">
                  {batteryData?.current?.percentage?.toFixed(0) || "0"}%
                </p>
                <p className="text-xs text-gray-600">
                  {getBatteryStatusText()}: {batteryData?.current?.charge_rate?.toFixed(2) || "0"} kW
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-blue-100 rounded-full">
                <FaExchangeAlt className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Optimization Mode</p>
                <p className="text-2xl font-bold text-blue-700">{batteryMode === "smart" ? "Smart" : "Manual"}</p>
                <p className="text-xs text-gray-600">
                  Priority: {energyPriorityMode.charAt(0).toUpperCase() + energyPriorityMode.slice(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-purple-100 rounded-full">
                <FaLightbulb className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Smart Scheduling</p>
                <p className="text-2xl font-bold text-purple-700">{scheduleActive ? "Active" : "Inactive"}</p>
                <p className="text-xs text-gray-600">{recommendations.length} optimization recommendations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different optimization views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="battery">Battery Optimization</TabsTrigger>
          <TabsTrigger value="forecast">Energy Forecast</TabsTrigger>
          <TabsTrigger value="appliances">Appliance Optimization</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Battery Optimization Tab */}
        <TabsContent value="battery">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaBatteryFull className="mr-2 text-teal-600" />
                  Battery Performance
                </CardTitle>
                <CardDescription>Historical and real-time battery data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatBatteryData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
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

            <Card>
              <CardHeader>
                <CardTitle>Battery Control</CardTitle>
                <CardDescription>Manage your battery settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="battery-mode">Optimization Mode</Label>
                    <div className="flex items-center space-x-2">
                      <span className={batteryMode === "manual" ? "font-medium" : "text-gray-500"}>Manual</span>
                      <Switch
                        id="battery-mode"
                        checked={batteryMode === "smart"}
                        onCheckedChange={(checked) => setBatteryMode(checked ? "smart" : "manual")}
                      />
                      <span className={batteryMode === "smart" ? "font-medium" : "text-gray-500"}>Smart</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Battery Minimum Threshold</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[batteryThresholds.min]}
                        min={0}
                        max={100}
                        step={5}
                        onValueChange={(value) => setBatteryThresholds({ ...batteryThresholds, min: value[0] })}
                        disabled={batteryMode === "smart"}
                      />
                      <span className="w-12 text-center">{batteryThresholds.min}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Battery Maximum Threshold</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[batteryThresholds.max]}
                        min={0}
                        max={100}
                        step={5}
                        onValueChange={(value) => setBatteryThresholds({ ...batteryThresholds, max: value[0] })}
                        disabled={batteryMode === "smart"}
                      />
                      <span className="w-12 text-center">{batteryThresholds.max}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Grid Export Threshold</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[batteryThresholds.gridExport]}
                        min={0}
                        max={100}
                        step={5}
                        onValueChange={(value) => setBatteryThresholds({ ...batteryThresholds, gridExport: value[0] })}
                        disabled={batteryMode === "smart"}
                      />
                      <span className="w-12 text-center">{batteryThresholds.gridExport}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Grid Import Threshold</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[batteryThresholds.gridImport]}
                        min={0}
                        max={100}
                        step={5}
                        onValueChange={(value) => setBatteryThresholds({ ...batteryThresholds, gridImport: value[0] })}
                        disabled={batteryMode === "smart"}
                      />
                      <span className="w-12 text-center">{batteryThresholds.gridImport}%</span>
                    </div>
                  </div>

                  <Button className="w-full" disabled={batteryMode === "smart"}>
                    Apply Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Optimal Battery Usage</CardTitle>
                <CardDescription>AI-recommended battery charging and discharging times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h3 className="font-medium text-teal-700 mb-2">Optimal Charging Time</h3>
                      <p className="text-lg font-bold">{getOptimalUsageTime().charge}</p>
                      <p className="text-sm text-gray-600">When solar generation is highest</p>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h3 className="font-medium text-teal-700 mb-2">Optimal Discharging Time</h3>
                      <p className="text-lg font-bold">{getOptimalUsageTime().discharge}</p>
                      <p className="text-sm text-gray-600">When grid prices are highest</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Battery Optimization Strategy</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        The system uses AI to predict the optimal times to charge and discharge your battery based on
                        solar generation, electricity prices, and your usage patterns.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-2 mt-1">
                            <FaChartLine className="text-green-600 text-xs" />
                          </div>
                          <p>Charges battery when solar production exceeds household demand</p>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-2 mt-1">
                            <FaChartLine className="text-green-600 text-xs" />
                          </div>
                          <p>Discharges battery during peak electricity prices to reduce costs</p>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-2 mt-1">
                            <FaChartLine className="text-green-600 text-xs" />
                          </div>
                          <p>Maintains minimum battery reserve for power outages</p>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-2 mt-1">
                            <FaChartLine className="text-green-600 text-xs" />
                          </div>
                          <p>Adapts to weather forecasts to optimize for upcoming conditions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Energy Forecast Tab */}
        <TabsContent value="forecast">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaChartLine className="mr-2 text-teal-600" />
                  Energy Forecast
                </CardTitle>
                <CardDescription>24-hour forecast of generation and consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formatForecastData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} kWh`, ""]} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="generation"
                        stackId="1"
                        name="Solar Generation"
                        stroke="#F6AD55"
                        fill="#F6AD55"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="consumption"
                        stackId="2"
                        name="Consumption"
                        stroke="#FC8181"
                        fill="#FC8181"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <FaSolarPanel className="mr-2 text-yellow-600" />
                    Generation Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-700">
                        {forecastData.reduce((total, item) => total + (item.solar_generation || 0), 0).toFixed(1)} kWh
                      </p>
                      <p className="text-sm text-gray-600">Total forecast generation</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm font-medium">Peak Generation</p>
                      <p className="text-lg">
                        {forecastData.length > 0
                          ? forecastData.reduce((max, item) =>
                              item.solar_generation > max.solar_generation ? item : max,
                            ).hour + ":00"
                          : "12:00"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <FaBolt className="mr-2 text-red-600" />
                    Consumption Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-700">
                        {forecastData.reduce((total, item) => total + (item.predicted_consumption || 0), 0).toFixed(1)}{" "}
                        kWh
                      </p>
                      <p className="text-sm text-gray-600">Total forecast consumption</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm font-medium">Peak Consumption</p>
                      <p className="text-lg">
                        {forecastData.length > 0
                          ? forecastData.reduce((max, item) =>
                              item.predicted_consumption > max.predicted_consumption ? item : max,
                            ).hour + ":00"
                          : "19:00"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <FaExchangeAlt className="mr-2 text-purple-600" />
                    Energy Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-700">
                        {forecastData
                          .reduce(
                            (total, item) => total + ((item.solar_generation || 0) - (item.predicted_consumption || 0)),
                            0,
                          )
                          .toFixed(1)}{" "}
                        kWh
                      </p>
                      <p className="text-sm text-gray-600">Net energy balance</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm font-medium">Grid Dependency</p>
                      <p className="text-lg">
                        {
                          forecastData.filter(
                            (item) => (item.solar_generation || 0) < (item.predicted_consumption || 0),
                          ).length
                        }{" "}
                        hours requiring grid
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Appliance Optimization Tab */}
        <TabsContent value="appliances">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaPlug className="mr-2 text-teal-600" />
                  Appliance Optimization
                </CardTitle>
                <CardDescription>Smart scheduling for your appliances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Appliance</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Current Usage Pattern</th>
                        <th className="px-4 py-2 text-left">Recommended Usage</th>
                        <th className="px-4 py-2 text-left">Potential Savings</th>
                        <th className="px-4 py-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appliancePatterns.length > 0 ? (
                        appliancePatterns.map((appliance, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-2">{appliance.name}</td>
                            <td className="px-4 py-2">{appliance.type}</td>
                            <td className="px-4 py-2">{appliance.current_usage}</td>
                            <td className="px-4 py-2">{appliance.recommended_usage}</td>
                            <td className="px-4 py-2">{appliance.potential_savings}</td>
                            <td className="px-4 py-2">
                              <Button size="sm" onClick={() => applyRecommendedSchedule(appliance.id)}>
                                Apply
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                            No appliance data available. Connect smart appliances to enable optimization.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Consumption Patterns</CardTitle>
                <CardDescription>When your appliances are used throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demandPrediction}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} kWh`, ""]} />
                      <Legend />
                      <Bar dataKey="appliances" name="Appliance Usage" fill="#4FD1C5" />
                      <Bar dataKey="baseline" name="Baseline Consumption" fill="#CBD5E0" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Smart Scheduling</CardTitle>
                <CardDescription>Optimize appliance usage times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="schedule-active">Schedule Active</Label>
                    <Switch id="schedule-active" checked={scheduleActive} onCheckedChange={setScheduleActive} />
                  </div>

                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="font-medium text-teal-700 mb-2">Recommended Schedule Times</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Dishwasher:</span>
                        <span className="font-medium">13:00 - 14:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Laundry:</span>
                        <span className="font-medium">10:00 - 12:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>EV Charging:</span>
                        <span className="font-medium">11:00 - 15:00</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-700 mb-2">Optimization Strategy</h3>
                    <p className="text-sm text-gray-600">
                      Run high-energy appliances during peak solar production to maximize self-consumption and minimize
                      grid dependency.
                    </p>
                  </div>

                  <Button className="w-full">Apply to All Devices</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaLightbulb className="mr-2 text-teal-600" />
                Energy Optimization Recommendations
              </CardTitle>
              <CardDescription>AI-powered suggestions to improve energy efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.length > 0 ? (
                  recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-teal-50 p-4 rounded-lg">
                      <h3 className="font-medium text-teal-700 mb-2">{recommendation.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{recommendation.description}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-teal-600 font-medium">
                          Potential Savings: {recommendation.potential_savings}
                        </span>
                        <span className="text-gray-500">Difficulty: {recommendation.difficulty}</span>
                      </div>
                      <Button className="mt-4 w-full" variant={recommendation.is_applied ? "outline" : "default"}>
                        {recommendation.is_applied ? "Applied" : "Apply"}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-2 text-center py-8 text-gray-500">
                    <FaLightbulb className="mx-auto text-gray-300 text-4xl mb-2" />
                    <p>
                      No recommendations available. The system needs more data to generate personalized suggestions.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                Recommendations are updated daily based on your energy usage patterns, weather forecast, and market
                conditions.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Optimization Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Optimization Settings</DialogTitle>
            <DialogDescription>Configure your energy optimization preferences</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="energy-priority" className="text-right">
                Energy Priority
              </Label>
              <Select value={energyPriorityMode} onValueChange={setEnergyPriorityMode}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost">Cost Savings</SelectItem>
                  <SelectItem value="selfConsumption">Self Consumption</SelectItem>
                  <SelectItem value="eco">Eco Friendly</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="auto-smart-charging" className="text-right">
                Smart Charging
              </Label>
              <div className="flex items-center col-span-3">
                <Switch
                  id="auto-smart-charging"
                  checked={batteryMode === "smart"}
                  onCheckedChange={(checked) => setBatteryMode(checked ? "smart" : "manual")}
                />
                <Label htmlFor="auto-smart-charging" className="ml-2">
                  {batteryMode === "smart" ? "Enabled" : "Disabled"}
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appliance-schedule" className="text-right">
                Appliance Scheduling
              </Label>
              <div className="flex items-center col-span-3">
                <Switch id="appliance-schedule" checked={scheduleActive} onCheckedChange={setScheduleActive} />
                <Label htmlFor="appliance-schedule" className="ml-2">
                  {scheduleActive ? "Enabled" : "Disabled"}
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="min-battery" className="text-right">
                Min Battery Level
              </Label>
              <div className="flex items-center col-span-3">
                <Input
                  id="min-battery"
                  type="number"
                  value={batteryThresholds.min}
                  onChange={(e) => setBatteryThresholds({ ...batteryThresholds, min: Number.parseInt(e.target.value) })}
                  className="w-20"
                  min="0"
                  max="100"
                />
                <span className="ml-2">%</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplySettings}>Apply Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Optimization

