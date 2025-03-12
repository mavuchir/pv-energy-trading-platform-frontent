"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const EnergyAnalytics = ({ data }) => {
  const [timeRange, setTimeRange] = useState("week")

  // If no data is provided, show a placeholder message
  if (!data) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    )
  }

  // Extract data for the selected time range
  const consumptionData = data.consumption?.[timeRange] || []
  const generationData = data.generation?.[timeRange] || []
  const batteryData = data.battery?.[timeRange] || []
  const applianceData = data.appliances || []

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Energy Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="generation">Generation</TabsTrigger>
          <TabsTrigger value="appliances">Appliances</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totals?.generation?.toFixed(2) || 0} kWh</div>
                <p className="text-xs text-muted-foreground">
                  {data.trends?.generation > 0
                    ? `+${data.trends.generation.toFixed(1)}% from previous ${timeRange}`
                    : `${data.trends?.generation?.toFixed(1) || 0}% from previous ${timeRange}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totals?.consumption?.toFixed(2) || 0} kWh</div>
                <p className="text-xs text-muted-foreground">
                  {data.trends?.consumption > 0
                    ? `+${data.trends.consumption.toFixed(1)}% from previous ${timeRange}`
                    : `${data.trends?.consumption?.toFixed(1) || 0}% from previous ${timeRange}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Energy Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((data.totals?.generation || 0) - (data.totals?.consumption || 0)).toFixed(2)} kWh
                </div>
                <p className="text-xs text-muted-foreground">Net energy balance</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Energy Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={generationData.map((gen, i) => ({
                      name: gen.timestamp,
                      generation: gen.value,
                      consumption: consumptionData[i]?.value || 0,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="generation" stroke="#8884d8" name="Generation (kWh)" />
                    <Line type="monotone" dataKey="consumption" stroke="#82ca9d" name="Consumption (kWh)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consumption Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consumptionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Consumption (kWh)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peak Consumption Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.hourly?.consumption || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Average Consumption (kWh)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generation Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={generationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Generation (kWh)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Battery Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={batteryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="level" name="Battery Level (%)" stroke="#FFBB28" />
                    <Line type="monotone" dataKey="charge_rate" name="Charge Rate (kW)" stroke="#FF8042" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appliances">
          <Card>
            <CardHeader>
              <CardTitle>Appliance Energy Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={applianceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="daily_energy"
                        nameKey="name"
                      >
                        {applianceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toFixed(2)} kWh`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Top Energy Consumers</h3>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Appliance</th>
                        <th className="text-right py-2">Daily (kWh)</th>
                        <th className="text-right py-2">Monthly (kWh)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applianceData
                        .sort((a, b) => b.daily_energy - a.daily_energy)
                        .slice(0, 5)
                        .map((appliance, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{appliance.name}</td>
                            <td className="text-right py-2">{appliance.daily_energy.toFixed(2)}</td>
                            <td className="text-right py-2">{(appliance.daily_energy * 30).toFixed(2)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnergyAnalytics

