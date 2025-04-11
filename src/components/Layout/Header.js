"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { FaBars, FaBell, FaUser, FaSignOutAlt, FaCog } from "react-icons/fa"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

const Header = ({ toggleSidebar, user }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New energy trading opportunity available", read: false },
    { id: 2, message: "Battery level below 20%", read: false },
    { id: 3, message: "System update available", read: true },
  ])

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const handleNotificationClick = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="p-1 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none">
          <FaBars className="h-6 w-6" />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <FaBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="p-2 font-medium text-sm">Notifications</div>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-3 cursor-pointer ${notification.read ? "opacity-60" : ""}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm">{notification.message}</span>
                    <span className="text-xs text-gray-500">Just now</span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-3 text-center text-sm text-gray-500">No notifications</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <FaUser className="h-5 w-5" />
              <span className="hidden md:inline-block">{user?.full_name || user?.username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <FaCog className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <FaSignOutAlt className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Header
