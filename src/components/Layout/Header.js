import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/use-auth"
import {
  FaBars,
  FaUser,
  FaBell,
  FaSignOutAlt,
  FaCog,
  FaUserCircle,
  FaSearch,
  FaSun,
  FaMoon
} from "react-icons/fa"

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Dummy notifications for demo
  const notifications = [
    { id: 1, message: "Battery level below 20%", time: "5 min ago", read: false },
    { id: 2, message: "New energy production record!", time: "1 hour ago", read: false },
    { id: 3, message: "System update available", time: "2 days ago", read: true },
  ]

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // In a real app, this would toggle a dark mode class on the html/body element
    // and/or use a theme provider
  }

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars className="h-6 w-6" />
            </button>
            <Link to="/dashboard" className="flex items-center">
              <svg
                className="h-8 w-8 text-primary mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 3L4 9V21H20V9L12 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M8 14H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M10 9H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xl font-semibold text-gray-900">Energy Management</span>
            </Link>
          </div>

          <div className="flex-1 px-4 sm:px-6 lg:px-8">
            <div className="relative max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 sm:text-sm focus:ring-primary focus:border-primary"
                  placeholder="Search for anything..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isDarkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1 relative rounded-full text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <FaBell className="h-5 w-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>
              
              {notificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-2 px-3 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="py-2 divide-y divide-gray-200">
                        {notifications.map(notification => (
                          <div key={notification.id} className={`px-4 py-3 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}>
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 px-4 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    )}
                  </div>
                  <div className="py-1 border-t border-gray-200">
                    <Link to="/notifications" className="block px-4 py-2 text-center text-xs text-primary hover:bg-gray-100">
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {user?.first_name ? (
                    <span className="font-medium">{`${user.first_name[0]}${user.last_name ? user.last_name[0] : ''}`}</span>
                  ) : (
                    <FaUserCircle className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                <span className="hidden md:block">{user?.username || 'User'}</span>
              </button>

              {dropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.first_name && user?.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user?.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaUser className="mr-3 h-4 w-4 text-gray-500" />
                      Profile
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaCog className="mr-3 h-4 w-4 text-gray-500" />
                      Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="mr-3 h-4 w-4 text-gray-500" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
