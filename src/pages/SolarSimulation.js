import React, { useState, useEffect, useCallback } from "react"
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import { Switch } from "../components/ui/switch"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Sun, Cloud, Battery, Zap } from 'lucide-react'

const SolarSimulationPage = () => {
  const navigate = useNavigate()
  const [realTimeData, setRealTimeData] = useState(null)
  const [historicalData, setHistoricalData] = useState([])
  const [systemStatus, setSystemStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRealTimeData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/energy/real-time', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setRealTimeData(response.data.current)
      setHistoricalData(response.data.historical)
      setSystemStatus(response.data.systemStatus)
    } catch (error) {
      console.error('Error fetching real-time data:', error)
      setError(error.response?.data?.message || 'Error fetching data')
    }
  }, [])

  useEffect(() => {
    fetchRealTimeData()
    // Update real-time data every 5 seconds
    const interval = setInterval(fetchRealTimeData, 5000)
    return () => clearInterval(interval)
  }, [fetchRealTimeData])

  if (loading) {
    return <div className="loading-spinner" />
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="container mx-auto p-4">
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
            <div className="text-2xl font-bold">
              {realTimeData?.generation.toFixed(2)} W
            </div>
            <p className="text-sm text-muted-foreground">
              Efficiency: {systemStatus?.efficiency}%
            </p>
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
            <div className="text-2xl font-bold">
              {realTimeData?.consumption.toFixed(2)} W
            </div>
            <p className="text-sm text-muted-foreground">
              Grid Status: {realTimeData?.gridStatus}
            </p>
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
            <div className="text-2xl font-bold">
              {realTimeData?.batteryLevel.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${realTimeData?.batteryLevel}%` }}
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
            <div className="text-2xl font-bold">
              {systemStatus?.weather.temperature.toFixed(1)}°C
            </div>
            <p className="text-sm text-muted-foreground">
              Cloud Cover: {systemStatus?.weather.cloudCover.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Live Energy Flow</CardTitle>
          <CardDescription>Real-time generation vs consumption</CardDescription>
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
                />
                <Area 
                  type="monotone" 
                  dataKey="consumption" 
                  stackId="2"
                  stroke="#f43f5e" 
                  fill="#f43f5e" 
                  fillOpacity={0.3}
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
            <ResponsiveContainer width="100%" height={200}>
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
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Energy Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="generation" 
                  stroke="#4ade80" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#f43f5e" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SolarSimulationPage