"use client"

import { useState, useEffect } from "react"
import { FaUsers, FaHome, FaSolarPanel, FaBatteryFull, FaSync } from "react-icons/fa"
import AdminService from "../../services/AdminService"
import DashboardHeader from "./DashboardHeader"
import EnergyOverviewCard from "../widgets/EnergyOverviewCard"
import AdminUserWidget from "../widgets/AdminUserWidget"
import AdminCommunityWidget from "../widgets/AdminCommunityWidget"
import AdminAuditLogWidget from "../widgets/AdminAuditLogWidget"
import AdminMarketPriceWidget from "../widgets/AdminMarketPriceWidget"
import { useAuth } from "../../contexts/AuthContext"

const AdminDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch admin dashboard data
        const data = await AdminService.getDashboard()
        setDashboardData(data)
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err)
        setError("Failed to load admin dashboard data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchAdminDashboard()
  }, [])

  const handleRefresh = async () => {
    try {
      setLoading(true)
      setError(null)

      // Refresh admin dashboard data
      const data = await AdminService.getDashboard()
      setDashboardData(data)
    } catch (err) {
      console.error("Error refreshing admin dashboard data:", err)
      setError("Failed to refresh admin dashboard data. Please try again.")
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
            Welcome back, {user?.full_name || user?.username || "Admin"}!
          </h1>
          <p className="text-gray-600">System Administration Dashboard</p>
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
        <div className="flex justify-end mb-6">
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <FaSync className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <EnergyOverviewCard
            title="Total Users"
            value={dashboardData?.user_stats?.total || 0}
            unit=""
            change={null}
            icon={<FaUsers className="text-blue-500" />}
            color="blue"
          />
          <EnergyOverviewCard
            title="Total Communities"
            value={dashboardData?.community_stats?.total || 0}
            unit=""
            change={null}
            icon={<FaHome className="text-green-500" />}
            color="green"
          />
          <EnergyOverviewCard
            title="Total Solar Capacity"
            value={dashboardData?.system_stats?.total_solar_capacity || 0}
            unit="kW"
            change={null}
            icon={<FaSolarPanel className="text-yellow-500" />}
            color="yellow"
          />
          <EnergyOverviewCard
            title="Total Battery Capacity"
            value={dashboardData?.system_stats?.total_battery_capacity || 0}
            unit="kWh"
            change={null}
            icon={<FaBatteryFull className="text-purple-500" />}
            color="purple"
          />
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AdminUserWidget userStats={dashboardData?.user_stats} />
          <AdminCommunityWidget communityStats={dashboardData?.community_stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminMarketPriceWidget currentPrice={dashboardData?.current_market_price} />
          <AdminAuditLogWidget recentLogs={dashboardData?.recent_logs} />
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
