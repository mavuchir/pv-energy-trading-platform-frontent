"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaSolarPanel,
  FaBatteryFull,
  FaPlug,
  FaExchangeAlt,
  FaChartLine,
  FaSync,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa"
import EnergyService from "../services/EnergyService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/Tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const Optimization = () => {
  const [period, setPeriod] = useState("day")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [generationData, setGenerationData] = useState([])
  const [consumptionData, setConsumptionData] = useState([])
  const [batteryData, setBatteryData] = useState([])
  const [gridData, setGridData] = useState([])
  const [energyStats, setEnergyStats] = useState({
    totalGeneration: 0,
    totalConsumption: 0,
    netEnergy: 0,
    batteryUsage: 0,
    gridImport: 0,
    gridExport: 0,
    selfConsumption: 0,
    selfSufficiency: 0,
  })
  const navigate = useNavigate()

  // Fetch data based on selected period
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch generation data
      const generationResponse = await EnergyService.getGenerationData(period)
      if (generationResponse.success) {
        setGenerationData(generationResponse.data || [])
      } else {
        console.error("Error fetching generation data:", generationResponse.error)
      }

      // Fetch consumption data
      const consumptionResponse = await EnergyService.getConsumptionData(period)
      if (consumptionResponse.success) {
        setConsumptionData(consumptionResponse.data || [])
      } else {
        console.error("Error fetching consumption data:", consumptionResponse.error)
      }

      // Fetch battery data
      const batteryResponse = await EnergyService.getBatteryData(period)
      if (batteryResponse.success) {
        setBatteryData(batteryResponse.data || [])
      } else {
        console.error("Error fetching battery data:", batteryResponse.error)
      }

      // Fetch grid data
      const gridResponse = await EnergyService.getGridData(period)
      if (gridResponse.success) {
        // Ensure gridData is an array
        const gridDataArray = Array.isArray(gridResponse.data) ? gridResponse.data : []
        setGridData(gridDataArray)
      } else {
        console.error("Error fetching grid data:", gridResponse.error)
        // Set empty array to avoid forEach errors
        setGridData([])
      }

      setSuccess("Data loaded successfully")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error fetching optimization data:", err)
      setError("Failed to load optimization data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Calculate energy statistics
  const calculateEnergyStats = () => {
    // Initialize values
    let totalGeneration = 0
    let totalConsumption = 0
    let gridImport = 0
    let gridExport = 0

    // Sum up generation
    generationData.forEach((item) => {
      totalGeneration += item.amount || 0
    })

    // Sum up consumption
    consumptionData.forEach((item) => {
      totalConsumption += item.amount || 0
    })

    // Sum up grid interactions
    if (Array.isArray(gridData)) {
      gridData.forEach((item) => {
        if (item.direction === "import") {
          gridImport += item.amount || 0
        } else if (item.direction === "export") {
          gridExport += item.amount || 0
        }
      })
    }

    // Calculate derived metrics
    const netEnergy = totalGeneration - totalConsumption
    const selfConsumption = Math.max(0, totalGeneration - gridExport)
    const selfSufficiency = totalConsumption > 0 ? ((totalConsumption - gridImport) / totalConsumption) * 100 : 0
    const batteryUsage = Math.abs(netEnergy - (gridExport - gridImport))

    setEnergyStats({
      totalGeneration: Number.parseFloat(totalGeneration.toFixed(2)),
      totalConsumption: Number.parseFloat(totalConsumption.toFixed(2)),
      netEnergy: Number.parseFloat(netEnergy.toFixed(2)),
      batteryUsage: Number.parseFloat(batteryUsage.toFixed(2)),
      gridImport: Number.parseFloat(gridImport.toFixed(2)),
      gridExport: Number.parseFloat(gridExport.toFixed(2)),
      selfConsumption: Number.parseFloat(selfConsumption.toFixed(2)),
      selfSufficiency: Number.parseFloat(selfSufficiency.toFixed(2)),
    })
  }

  // Fetch data on component mount and when period changes
  useEffect(() => {
    fetchData()
  }, [period])

  // Calculate stats when data changes
  useEffect(() => {
    calculateEnergyStats()
  }, [generationData, consumptionData, gridData])

  // Prepare data for energy flow chart
  const prepareEnergyFlowData = () => {
    // Create a map to store data by time
    const dataByTime = new Map()

    // Process generation data
    generationData.forEach((item) => {
      const timestamp = new Date(item.timestamp)

      // Format time based on selected period
      let timeKey
      if (period === "day") {
        timeKey = timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      } else if (period === "week") {
        timeKey = timestamp.toLocaleDateString([], { weekday: "short" })
      } else {
        // month
        timeKey = timestamp.toLocaleDateString([], { month: "short", day: "numeric" })
      }

      if (!dataByTime.has(timeKey)) {
        dataByTime.set(timeKey, {
          time: timeKey,
          timestamp: timestamp,
          generation: 0,
          consumption: 0,
          gridImport: 0,
          gridExport: 0,
        })
      }

      dataByTime.get(timeKey).generation += item.amount || 0
    })

    // Process consumption data
    consumptionData.forEach((item) => {
      const timestamp = new Date(item.timestamp)

      // Format time based on selected period
      let timeKey
      if (period === "day") {
        timeKey = timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      } else if (period === "week") {
        timeKey = timestamp.toLocaleDateString([], { weekday: "short" })
      } else {
        // month
        timeKey = timestamp.toLocaleDateString([], { month: "short", day: "numeric" })
      }

      if (!dataByTime.has(timeKey)) {
        dataByTime.set(timeKey, {
          time: timeKey,
          timestamp: timestamp,
          generation: 0,
          consumption: 0,
          gridImport: 0,
          gridExport: 0,
        })
      }

      dataByTime.get(timeKey).consumption += item.amount || 0
    })

    // Process grid data
    if (Array.isArray(gridData)) {
      gridData.forEach((item) => {
        const timestamp = new Date(item.timestamp)

        // Format time based on selected period
        let timeKey
        if (period === "day") {
          timeKey = timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        } else if (period === "week") {
          timeKey = timestamp.toLocaleDateString([], { weekday: "short" })
        } else {
          // month
          timeKey = timestamp.toLocaleDateString([], { month: "short", day: "numeric" })
        }

        if (!dataByTime.has(timeKey)) {
          dataByTime.set(timeKey, {
            time: timeKey,
            timestamp: timestamp,
            generation: 0,
            consumption: 0,
            gridImport: 0,
            gridExport: 0,
          })
        }

        if (item.direction === "import") {
          dataByTime.get(timeKey).gridImport += item.amount || 0
        } else if (item.direction === "export") {
          dataByTime.get(timeKey).gridExport += item.amount || 0
        }
      })
    }

    // Convert map to array
    const chartData = Array.from(dataByTime.values())

    // Sort by timestamp
    chartData.sort((a, b) => a.timestamp - b.timestamp)

    return chartData
  }

  // Prepare data for energy distribution pie chart
  const prepareEnergyDistributionData = () => {
    return [
      { name: "Self-Consumption", value: energyStats.selfConsumption, color: "#4FD1C5" },
      { name: "Grid Export", value: energyStats.gridExport, color: "#38B2AC" },
      { name: "Grid Import", value: energyStats.gridImport, color: "#FC8181" },
      { name: "Battery Usage", value: energyStats.batteryUsage, color: "#F6AD55" },
    ].filter((item) => item.value > 0)
  }

  // Prepare data for battery chart
  const prepareBatteryData = () => {
    return batteryData.map((item) => ({
      time: new Date(item.timestamp).toLocaleTimeString([], {
        hour: period === "day" ? "2-digit" : undefined,
        minute: period === "day" ? "2-digit" : undefined,
        month: period !== "day" ? "short" : undefined,
        day: period !== "day" ? "numeric" : undefined,
      }),
      percentage: item.percentage || 0,
      charge_rate: item.charge_rate || 0,
    }))
  }

  const energyFlowData = prepareEnergyFlowData()
  const energyDistributionData = prepareEnergyDistributionData()
  const batteryChartData = prepareBatteryData()

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-600">Energy Optimization</h1>
          <p className="text-gray-600">Analyze and optimize your energy usage</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Tabs value={period} onValueChange={setPeriod} className="w-auto">
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={fetchData} className="bg-gray-200 hover:bg-gray-300 text-gray-800">
            <FaSync className={loading ? "mr-2 animate-spin" : "mr-2"} />
            Refresh
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

      {success && (
        <Card className="bg-green-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center text-green-600">
              <FaCheckCircle className="mr-2" />
              <p>{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Energy Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-yellow-100 rounded-full">
                <FaSolarPanel className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Generation</p>
                <p className="text-2xl font-bold text-yellow-700">{energyStats.totalGeneration} kWh</p>
                <p className="text-xs text-green-600">
                  {energyStats.netEnergy >= 0
                    ? `+${energyStats.netEnergy} kWh net surplus`
                    : `${energyStats.netEnergy} kWh net deficit`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-blue-100 rounded-full">
                <FaPlug className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Consumption</p>
                <p className="text-2xl font-bold text-blue-700">{energyStats.totalConsumption} kWh</p>
                <p className="text-xs text-gray-600">Self-sufficiency: {energyStats.selfSufficiency.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-green-50 border-teal-100">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-teal-100 rounded-full">
                <FaBatteryFull className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Battery Usage</p>
                <p className="text-2xl font-bold text-teal-700">{energyStats.batteryUsage} kWh</p>
                <p className="text-xs text-gray-600">Energy cycled through battery</p>
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
                <p className="text-sm text-gray-600">Grid Interaction</p>
                <p className="text-2xl font-bold text-purple-700">
                  {energyStats.gridImport > energyStats.gridExport
                    ? `${energyStats.gridImport} kWh in`
                    : `${energyStats.gridExport} kWh out`}
                </p>
                <p className="text-xs text-gray-600">
                  {energyStats.gridImport > 0 && energyStats.gridExport > 0
                    ? `${energyStats.gridImport} kWh in, ${energyStats.gridExport} kWh out`
                    : energyStats.gridImport > 0
                      ? `${energyStats.gridImport} kWh imported`
                      : `${energyStats.gridExport} kWh exported`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Energy Flow Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <FaChartLine className="mr-2" />
              Energy Flow
            </CardTitle>
            <CardDescription>
              {period === "day"
                ? "Today's energy generation and consumption"
                : period === "week"
                  ? "This week's energy patterns"
                  : "This month's energy overview"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={energyFlowData}>
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
                  <Area
                    type="monotone"
                    dataKey="gridImport"
                    stackId="3"
                    stroke="#9F7AEA"
                    fill="#9F7AEA"
                    fillOpacity={0.6}
                    name="Grid Import"
                  />
                  <Area
                    type="monotone"
                    dataKey="gridExport"
                    stackId="4"
                    stroke="#38B2AC"
                    fill="#38B2AC"
                    fillOpacity={0.6}
                    name="Grid Export"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <FaExchangeAlt className="mr-2" />
              Energy Distribution
            </CardTitle>
            <CardDescription>How your energy is distributed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {energyDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={energyDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {energyDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} kWh`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500">No energy distribution data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Battery Chart */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <FaBatteryFull className="mr-2" />
            Battery Performance
          </CardTitle>
          <CardDescription>Battery level and charge/discharge rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {batteryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={batteryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" unit="%" domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" unit=" kW" />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="percentage"
                    stroke="#4FD1C5"
                    name="Battery Level"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="charge_rate"
                    stroke="#F6AD55"
                    name="Charge Rate"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No battery data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="mb-6 bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-teal-700">
            <FaCheckCircle className="mr-2" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {energyStats.selfSufficiency < 50 && (
              <div className="p-3 bg-white rounded-md">
                <h3 className="font-medium text-teal-700">Increase Self-Sufficiency</h3>
                <p className="text-sm text-gray-600">
                  Your self-sufficiency is {energyStats.selfSufficiency.toFixed(1)}%. Consider shifting energy-intensive
                  activities to daylight hours to use more of your solar generation.
                </p>
              </div>
            )}

            {energyStats.gridExport > energyStats.totalConsumption * 0.5 && (
              <div className="p-3 bg-white rounded-md">
                <h3 className="font-medium text-teal-700">Excess Energy Production</h3>
                <p className="text-sm text-gray-600">
                  You're exporting {energyStats.gridExport} kWh to the grid. Consider adding more battery storage or
                  selling this excess energy through the trading platform.
                </p>
              </div>
            )}

            {energyStats.gridImport > energyStats.totalConsumption * 0.5 && (
              <div className="p-3 bg-white rounded-md">
                <h3 className="font-medium text-teal-700">High Grid Dependency</h3>
                <p className="text-sm text-gray-600">
                  You're importing {energyStats.gridImport} kWh from the grid. Consider increasing your solar capacity
                  or reducing consumption during non-productive hours.
                </p>
              </div>
            )}

            {energyStats.batteryUsage < energyStats.totalGeneration * 0.2 && (
              <div className="p-3 bg-white rounded-md">
                <h3 className="font-medium text-teal-700">Underutilized Battery</h3>
                <p className="text-sm text-gray-600">
                  Your battery is only cycling {energyStats.batteryUsage} kWh. Configure your system to store more
                  excess energy during peak generation times.
                </p>
              </div>
            )}

            {/* Default recommendation if none of the above apply */}
            {energyStats.selfSufficiency >= 50 &&
              energyStats.gridExport <= energyStats.totalConsumption * 0.5 &&
              energyStats.gridImport <= energyStats.totalConsumption * 0.5 &&
              energyStats.batteryUsage >= energyStats.totalGeneration * 0.2 && (
                <div className="p-3 bg-white rounded-md">
                  <h3 className="font-medium text-teal-700">Optimal Performance</h3>
                  <p className="text-sm text-gray-600">
                    Your energy system is performing well! Continue monitoring for seasonal adjustments.
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={() => navigate("/trading")} className="bg-teal-600 hover:bg-teal-700">
          <FaExchangeAlt className="mr-2" />
          Trade Energy
        </Button>
        <Button onClick={() => navigate("/appliance-control")} className="bg-blue-600 hover:bg-blue-700">
          <FaPlug className="mr-2" />
          Manage Appliances
        </Button>
        <Button onClick={() => navigate("/dashboard")} className="bg-gray-600 hover:bg-gray-700">
          <FaChartLine className="mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}

export default Optimization
