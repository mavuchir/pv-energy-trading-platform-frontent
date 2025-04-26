"use client"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import {
  FaTimes,
  FaHome,
  FaChartLine,
  FaPlug,
  FaExchangeAlt,
  FaUsers,
  FaLightbulb,
  FaCloudSun,
  FaCog,
  FaUserCog,
  FaBatteryHalf,
  FaHouseUser,
} from "react-icons/fa"

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const { user } = useAuth()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: FaHome },
    { name: "Analytics", href: "/analytics", icon: FaChartLine },
    { name: "Appliance Control", href: "/appliance-control", icon: FaPlug },
    { name: "Trading Platform", href: "/trading", icon: FaExchangeAlt },
    { name: "Community", href: "/community", icon: FaUsers },
    { name: "Optimization", href: "/optimization", icon: FaLightbulb },
    { name: "Weather", href: "/weather", icon: FaCloudSun },
    { name: "Settings", href: "/settings", icon: FaCog },
  ]

  // Add admin link if user has admin role
  if (user?.role === "admin") {
    navigation.push({ name: "Admin Panel", href: "/admin", icon: FaUserCog })
  }

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`md:hidden fixed inset-0 flex z-40 ${sidebarOpen ? "" : "pointer-events-none"}`}>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-gray-600 ${sidebarOpen ? "opacity-75" : "opacity-0 pointer-events-none"} transition-opacity ease-linear duration-300`}
          onClick={() => setSidebarOpen(false)}
        ></div>

        {/* Sidebar panel */}
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-teal-700 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition ease-in-out duration-300`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className={`ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white ${sidebarOpen ? "" : "pointer-events-none"}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <FaTimes className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex-shrink-0 flex items-center px-4">
            <span className="text-2xl font-bold text-white">EnergyTrade</span>
          </div>

          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive ? "bg-teal-800 text-white" : "text-teal-100 hover:bg-teal-600"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`mr-4 h-6 w-6 ${
                        isActive ? "text-teal-200" : "text-teal-300 group-hover:text-teal-200"
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Dummy element to force sidebar to shrink to fit close icon */}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-teal-700">
              <span className="text-2xl font-bold text-white">EnergyTrade</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 bg-teal-700 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive ? "bg-teal-800 text-white" : "text-teal-100 hover:bg-teal-600"
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-6 w-6 ${
                          isActive ? "text-teal-200" : "text-teal-300 group-hover:text-teal-200"
                        }`}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar