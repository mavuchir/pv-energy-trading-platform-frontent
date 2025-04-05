"use client"
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from "react-icons/fa"

const NotificationCenter = ({ notifications = [], onDismiss }) => {
  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500" />
      case "warning":
        return <FaExclamationTriangle className="text-yellow-500" />
      case "danger":
        return <FaTimesCircle className="text-red-500" />
      case "info":
      default:
        return <FaInfoCircle className="text-blue-500" />
    }
  }

  // Get background color based on notification type
  const getBackgroundColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50"
      case "warning":
        return "bg-yellow-50"
      case "danger":
        return "bg-red-50"
      case "info":
      default:
        return "bg-blue-50"
    }
  }

  return (
    <div className="space-y-3">
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border ${notification.read ? "bg-gray-50 border-gray-200" : `${getBackgroundColor(notification.type)} border-l-4 border-${notification.type === "info" ? "blue" : notification.type === "success" ? "green" : notification.type === "warning" ? "yellow" : "red"}-500`}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="mt-1 mr-2">{getIcon(notification.type)}</div>
                <div>
                  <p className={notification.read ? "text-gray-700" : "text-gray-900"}>{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              </div>
              <button
                onClick={() => onDismiss && onDismiss(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <FaBell className="text-gray-300 text-3xl mb-2" />
          <p>No notifications</p>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter

