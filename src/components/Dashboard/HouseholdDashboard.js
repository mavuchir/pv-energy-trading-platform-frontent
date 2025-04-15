"use client"

import { useState, useEffect } from "react"
import { FaSolarPanel, FaBolt, FaBatteryFull, FaExchangeAlt, FaSync } from "react-icons/fa"
import EnergyService from "../../services/EnergyService"
import DashboardHeader from "./DashboardHeader"
import EnergyOverviewCard from "../widgets/EnergyOverviewCard"
import WeatherWidget from "../widgets/WeatherWidget"
import BatteryWidget from "../widgets/BatteryWidget"
import TradeWidget from "../widgets/TradeWidget"
import RecommendationWidget from "../widgets/RecomendationWidget"
import EnergyChart from "../charts/EnergyChart"
import { useAuth } from "../../contexts/AuthContext"

const HouseholdDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch dashboard data without the period parameter
        const energyData = await EnergyService.getDashboardData()
        setDashboardData(energyData)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleRefresh = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch dashboard data
      const energyData = await EnergyService.getDashboardData()
      setDashboardData(energyData)
    } catch (err) {
      console.error("Error refreshing dashboard data:", err)
      setError("Failed to refresh dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <>
       <DashboardHeader />

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.full_name || user?.username || "User"}!
          </h1>
          <p className="text-gray-600">Here's an overview of your energy system</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}


        {/* Controls */}
        {/* Controls */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          ><FaSync className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Energy Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <EnergyOverviewCard
            title="Energy Production"
            value={dashboardData?.today?.production || 0} // Adjusted for updated structure
            unit="kWh"
            change={dashboardData?.today?.productionChange || 0} // Adjusted for updated structure
            icon={<FaSolarPanel className="text-yellow-500" />}
            color="yellow"
          />
          <EnergyOverviewCard
            title="Energy Consumption"
            value={dashboardData?.today?.consumption || 0} // Adjusted for updated structure
            unit="kWh"
            change={dashboardData?.today?.consumptionChange || 0} // Adjusted for updated structure
            icon={<FaBolt className="text-blue-500" />}
            color="blue"
          />
          <EnergyOverviewCard
            title="Battery Level"
            value={dashboardData?.battery?.level || 0} // Assuming structure remains the same
            unit="%"
            change={dashboardData?.battery?.change || 0} // Assuming structure remains the same
            icon={<FaBatteryFull className="text-green-500" />}
            color="green"
          />
          <EnergyOverviewCard
            title="Energy Balance"
            value={dashboardData?.balance?.value || 0} // Adjusted for updated structure
            unit="kWh"
            change={dashboardData?.balance?.change || 0} // Adjusted for updated structure
            icon={<FaExchangeAlt className="text-purple-500" />}
            color="purple"
          />
        </div>

        {/* Energy Chart */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Energy Overview</h2>
          </div>
          <div className="p-4">
            <EnergyChart data={dashboardData?.chart_data || {}} /> {/* Assuming chart data structure */}
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <WeatherWidget />
          </div>
          <div className="lg:col-span-1">
            <BatteryWidget />
          </div>
          <div className="lg:col-span-1">
            <TradeWidget />
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6">
          <RecommendationWidget />
        </div>
      </div>
    </>
  )
}

export default HouseholdDashboard