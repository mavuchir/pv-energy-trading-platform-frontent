"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { useSocket } from "./SocketContext"

const NotificationContext = createContext()

export const useNotification = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { socket, connected } = useSocket()

  useEffect(() => {
    if (socket && connected) {
      // Listen for new notifications
      socket.on("notification", (notification) => {
        setNotifications((prev) => [notification, ...prev])
        setUnreadCount((prev) => prev + 1)
      })

      // Clean up event listener on unmount
      return () => {
        socket.off("notification")
      }
    }
  }, [socket, connected])

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )

    // Update unread count
    const unread = notifications.filter((n) => !n.read).length
    setUnreadCount(unread)
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  const clearNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
