"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useNavigation } from "../../contexts/NavigationContext"
import { useAuth } from "../../contexts/AuthContext"
import {
  FaHome,
  FaSolarPanel,
  FaPlug,
  FaExchangeAlt,
  FaUsers,
  FaCloudSun,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaAngleRight,
  FaAngleDown,
  FaAngleLeft,
  FaLightbulb,
  FaBell,
  FaUserShield,
} from "react-icons/fa"

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useNavigation()
  const { user, logout } = useAuth()
  const location = useLocation()
  const [expandedMenus, setExpandedMenus] = useState({
    energy: false,
    appliances: false,
    community: false,
    settings: false,
  })

  // Expand the menu that contains the current path
  useEffect(() => {
    if (location.pathname.includes("/energy") || location.pathname.includes("/battery")) {
      setExpandedMenus((prev) => ({ ...prev, energy: true }))
    } else if (location.pathname.includes("/settings") || location.pathname.includes("/profile")) {
      setExpandedMenus((prev) => ({ ...prev, settings: true }))
    }
  }, [location.pathname])

  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const isAdmin = user?.role === "admin"

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center">
          <FaLightbulb className="text-teal-600 h-8 w-8" />
          {isSidebarOpen && <span className="ml-2 text-xl font-semibold text-gray-800">EnergyTrade</span>}
        </Link>
        <button onClick={toggleSidebar} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none">
          {isSidebarOpen ? <FaAngleLeft /> : <FaAngleRight />}
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {/* Dashboard - different for admin and household */}
          <Link
            to={isAdmin ? "/admin" : "/dashboard"}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md ${
              isActive(isAdmin ? "/admin" : "/dashboard")
                ? "bg-teal-100 text-teal-700"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <FaHome className={`${isSidebarOpen ? "mr-3" : "mx-auto"} h-5 w-5`} />
            {isSidebarOpen && <span>Dashboard</span>}
          </Link>

          {/* Energy Section - Only for household users */}
          {!isAdmin && (
            <div>
              <button
                onClick={() => toggleMenu("energy")}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-md ${
                  expandedMenus.energy
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center">
                  <FaSolarPanel className={`${isSidebarOpen ? "mr-3" : "mx-auto"} h-5 w-5`} />
                  {isSidebarOpen && <span>Energy</span>}
                </div>
                {isSidebarOpen && (expandedMenus.energy ? <FaAngleDown /> : <FaAngleRight />)}
              </button>

              {isSidebarOpen && expandedMenus.energy && (
                <div className="pl-10 pr-2 mt-1 space-y-1">
                  <Link
                    to="/energy-production"
                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive("/energy-production")
                        ? "bg-teal-100 text-teal-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    Production
                  </Link>
                  <Link
                    to="/energy-consumption"
                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive("/energy-consumption")
                        ? "bg-teal-100 text-teal-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    Consumption
                  </Link>
                  <Link
                    to="/battery-status"
                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive("/battery-status")
                        ? "bg-teal-100 text-teal-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    Battery Status
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Appliance Control - Only for household users */}
          {!isAdmin && (
            <Link
              to="/appliance-control"
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md ${
                isActive("/appliance-control")
                  ? "bg-teal-100 text-teal-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <FaPlug className={`${isSidebarOpen ? "mr-3" : "mx-auto"} h-5 w-5`} />
              {isSidebarOpen && <span>Appliance Control</span>}
            </Link>
          )}

          {/* Trading - Only for household users */}
          {!isAdmin && (
            <Link
              to="/trading"
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md ${
                isActive("/trading")
                  ? "bg-teal-100 text-teal-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <FaExchangeAlt className={`${isSidebarOpen ? "mr-3" : "mx-auto"} h-5 w-5`} />
              {isSidebarOpen && <span>Trading Platform</span>}
            </Link>
          )}

          {/* Community */}
          <Link
            to="/community"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md ${
              isActive("/community")
                ? "bg-teal-100 text-teal-700"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <FaUsers className={`${isSidebarOpen ? "mr-3" : "mx-auto"} h-5 w-5`} />
            {isSidebarOpen && <span>Community</span>}
          </Link>

          {/* Weather */}
          <Link
            to="/weather"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md ${
              isActive("/weather") ? "bg-teal-100 text-teal-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <FaCloudSun className={`${isSidebarOpen ? "mr-3" : "mx-auto"} h-5 w-5`} />
            {isSidebarOpen && <span>Weather</span>}
          </Link>

          {/* Analytics */}
          <Link
            to="/analytics"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md ${
              isActive("/analytics")
                ? "bg-teal-100 text-teal-700"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <FaChartLine className={`${isSidebarOpen ? "mr-3" : "mx-auto"} h-5 w-5`} />
            {isSidebarOpen && <span>Analytics</span>}
          </Link>

          {/* User Management - Admin only */}
          {isAdmin && (
            <Link
              to="/user-management"
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md ${
                isActive("/user-management")
                  ? "bg-teal-100 text-teal-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <FaUserShield className={`${isSidebarOpen ? "mr-3" : "mx-auto"} h-5 w-5`} />
              {isSidebarOpen && <span>User Management</span>}
            </Link>
          )}

          {/* Notifications */}
          <Link
            to="/notifications"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md ${
              isActive("/notifications")
                ? "bg-teal-100 text-teal-700"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <FaBell className={`${isSidebarOpen ? "mr-3" : "mx-auto"} h-5 w-5`} />
            {isSidebarOpen && <span>Notifications</span>}
          </Link>

          {/* Settings Section */}
          <div>
            <button
              onClick={() => toggleMenu("settings")}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-md ${
                expandedMenus.settings
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center">
                <FaCog className={`${isSidebarOpen ? "mr-3" : "mx-auto"} h-5 w-5`} />
                {isSidebarOpen && <span>Settings</span>}
              </div>
              {isSidebarOpen && (expandedMenus.settings ? <FaAngleDown /> : <FaAngleRight />)}
            </button>

            {isSidebarOpen && expandedMenus.settings && (
              <div className="pl-10 pr-2 mt-1 space-y-1">
                <Link
                  to="/profile-settings"
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive("/profile-settings")
                      ? "bg-teal-100 text-teal-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive("/settings")
                      ? "bg-teal-100 text-teal-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {isAdmin ? "System Settings" : "User Settings"}
                </Link>
                {isAdmin && (
                  <Link
                    to="/system-settings"
                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive("/system-settings")
                        ? "bg-teal-100 text-teal-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    Advanced Settings
                  </Link>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 ${
            !isSidebarOpen && "justify-center"
          }`}
        >
          <FaSignOutAlt className={`${isSidebarOpen ? "mr-3" : ""} h-5 w-5`} />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
