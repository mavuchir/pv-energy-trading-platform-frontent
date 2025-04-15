import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigation } from "../../contexts/NavigationContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { useTheme } from "../../contexts/ThemeContext";
import { FaBell, FaUser, FaCog, FaSignOutAlt, FaSun, FaMoon, FaSearch, FaExclamationCircle } from "react-icons/fa";

const TopNavigation = () => {
  const { isScrollingDown } = useNavigation();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, fetchNotifications, markAsRead, loading: notificationsLoading, error: notificationsError } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false); // Renamed for clarity
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Fetch notifications on component mount and set up polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // Poll every minute

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Handle clicks outside of dropdown menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotificationsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      // No need to update local state here, it's handled in the context
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-20 bg-white border-b border-gray-200 transition-transform duration-300 ${
        isScrollingDown ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side - Search */}
        <div className="flex-1 min-w-0 md:ml-64">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full py-2 pl-10 pr-3 text-sm bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Right side - User menu, notifications, theme toggle */}
        <div className="flex items-center ml-4 space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
              className="p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none"
              aria-label="View notifications"
            >
              <FaBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotificationsMenu && (
              <div className="absolute right-0 w-80 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="p-4 text-center text-gray-500">Loading notifications...</div>
                  ) : notificationsError ? (
                    <div className="p-4 flex items-center text-red-500">
                      <FaExclamationCircle className="w-4 h-4 mr-2" />
                      {notificationsError}
                    </div>
                  ) : notifications && notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.is_read ? "bg-blue-50" : ""
                        }`}
                        onClick={() => {
                          handleMarkAsRead(notification.id);
                          setShowNotificationsMenu(false); // Close menu after clicking
                        }}
                      >
                        <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                        <p className="text-xs text-gray-500">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">No notifications</div>
                  )}
                </div>
                <div className="p-2 border-t border-gray-200">
                  <Link
                    to="/notifications"
                    className="block w-full py-2 text-xs font-medium text-center text-teal-600 hover:text-teal-700"
                    onClick={() => setShowNotificationsMenu(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center text-sm focus:outline-none"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="ml-2 text-gray-700 hidden md:block">{user?.full_name || user?.username || "User"}</span>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 w-48 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="py-1">
                  <Link
                    to="/profile-settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaUser className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaCog className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FaSignOutAlt className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
