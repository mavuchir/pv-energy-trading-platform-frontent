"use client"
import { Link } from "react-router-dom"
import { FaBell, FaCog, FaUser } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthContext"
import { useNotifications } from "../../contexts/NotificationContext"

const DashboardHeader = () => {
  const { user, logout } = useAuth()
  const { notifications } = useNotifications()

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-teal-600">Energy Trading System</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Link to="/notifications" className="relative p-2 text-gray-600 hover:text-teal-600">
              <FaBell />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Settings */}
            <Link to="/settings" className="p-2 text-gray-600 hover:text-teal-600">
              <FaCog />
            </Link>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 focus:outline-none">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                  <FaUser className="text-teal-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {user?.full_name || user?.username || "User"}
                </span>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Your Profile
                </Link>
                <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
