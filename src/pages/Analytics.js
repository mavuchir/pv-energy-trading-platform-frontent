"use client"

import { useState, useEffect } from "react"
import EnergyAnalytics from "../components/Analytics/EnergyAnalytics"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card"
import api from "../config/axios"
import { FaExclamationTriangle } from "react-icons/fa"

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)
        // Fetch all required data
        const [dashboardRes, statusRes, applianceRes] = await Promise.all([
          api.get("/household/dashboard"),
          api.get("/household/status"),
          api.get("/appliance/usage-summary"),
        ])

        // Transform the data into the format expected by EnergyAnalytics
        const analyticsData = {
          consumption: {
            week: dashboardRes.data.energy_forecast || [],
          },
          generation: {
            week: dashboardRes.data.energy_forecast || [],
          },
          battery: {
            week: [], // Add battery data if available
          },
          appliances: applianceRes.data.usageData || [],
          totals: {
            generation: dashboardRes.data.today_generation || 0,
            consumption: dashboardRes.data.today_consumption || 0,
          },
          trends: {
            generation: 0, // Calculate if historical data is available
            consumption: 0,
          },
          hourly: {
            consumption: [], // Add hourly data if available
          },
        }

        setAnalyticsData(analyticsData)
        setError(null)
      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError(err.response?.data?.msg || "Failed to fetch analytics data")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
    // Refresh data every 5 minutes
    const interval = setInterval(fetchAnalyticsData, 300000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Energy Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <EnergyAnalytics data={analyticsData} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Analytics

