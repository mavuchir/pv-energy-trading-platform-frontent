"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import NotificationService from "../services/NotificationService"; // Adjust the import path as necessary

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []); // Run only once

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { notifications: fetchedNotifications } = await NotificationService.getNotifications();
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter((n) => !n.is_read).length);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
      throw new Error("Failed to mark notification as read");
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      
      // Update local state
      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));

      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      throw new Error("Failed to mark all notifications as read");
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await NotificationService.deleteNotification(notificationId);

      // Update local state
      const deletedNotification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // Update unread count if needed
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      throw new Error("Failed to delete notification");
    }
  };

  // Add a new notification (for testing or local updates)
  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.is_read) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};