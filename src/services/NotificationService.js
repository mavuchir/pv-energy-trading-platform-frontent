import api from "./api";

class NotificationService {
  // Get notifications for the current user with optional parameters
  static async getNotifications(params = {}) {
    try {
      const response = await api.get("/notifications", { params });
      return response.data;
    } catch (error) {
      console.error("Get notifications error:", error);
      return { notifications: [], count: 0, total: 0, unread: 0 };
    }
  }

  // Mark a specific notification as read
  static async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error("Mark notification as read error:", error);
      throw error;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead() {
    try {
      const response = await api.put("/notifications/read-all");
      return response.data;
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
      throw error;
    }
  }

  // Delete a specific notification
  static async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error("Delete notification error:", error);
      throw error;
    }
  }

  // Get notification settings (if applicable - NO FLASK ROUTE PROVIDED)
  static async getNotificationSettings() {
    try {
      const response = await api.get("/notifications/settings");
      return response.data;
    } catch (error) {
      console.error("Get notification settings error:", error);
      return { settings: {} };
    }
  }

  // Update notification settings (if applicable - NO FLASK ROUTE PROVIDED)
  static async updateNotificationSettings(settings) {
    try {
      const response = await api.put("/notifications/settings", settings);
      return response.data;
    } catch (error) {
      console.error("Update notification settings error:", error);
      throw error;
    }
  }
}

export default NotificationService;