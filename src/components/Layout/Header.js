"use client"

import React from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"
import { FaBars, FaBell, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa"

const Header = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth()
  const { notifications, unreadCount } = useNotification()
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false)
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)

  const handleLogout = async () => {
    await logout()
    // Redirect is handled by the auth interceptor
  }

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <FaBars className="h-6 w-6" />
              </button>

              {/* Logo */}
              <Link to="/dashboard" className="flex items-center">
                <span className="text-2xl font-bold text-teal-600">EnergyTrade</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {/* Notifications dropdown */}
            <div className="relative ml-3">
              <button
                type="button"
                className="relative p-1 text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <span className="sr-only">View notifications</span>
                <FaBell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <span className="font-medium">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification, index) => (
                        <div
                          key={index}
                          className={`px-4 py-2 text-sm ${notification.read ? "text-gray-600" : "text-gray-900 font-medium bg-gray-50"}`}
                        >
                          <p>{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">No notifications</div>
                    )}

                    <div className="border-t">
                      <Link
                        to="/notifications"
                        className="block px-4 py-2 text-sm text-teal-600 hover:bg-gray-100"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative ml-3">
              <button
                type="button"
                className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white">
                  {user?.username?.charAt(0).toUpperCase() || <FaUser />}
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <div className="px-4 py-2 text-sm text-gray-900 border-b">
                      <p className="font-medium">{user?.username}</p>
                      <p className="text-gray-600">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <FaUser className="inline mr-2" /> Your Profile
                    </Link>

                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <FaCog className="inline mr-2" /> Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="inline mr-2" /> Sign out
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
