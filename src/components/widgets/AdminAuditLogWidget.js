import { Link } from "react-router-dom"
import { FaHistory, FaUser, FaKey, FaCog, FaExchangeAlt, FaUserEdit } from "react-icons/fa"

const AdminAuditLogWidget = ({ recentLogs = [] }) => {
  // Function to get icon based on action type
  const getActionIcon = (action) => {
    if (action.includes("login") || action.includes("logout")) {
      return <FaKey className="text-blue-500" />
    } else if (action.includes("register") || action.includes("user")) {
      return <FaUser className="text-green-500" />
    } else if (action.includes("setting")) {
      return <FaCog className="text-purple-500" />
    } else if (action.includes("trade") || action.includes("market")) {
      return <FaExchangeAlt className="text-yellow-500" />
    } else if (action.includes("profile") || action.includes("update")) {
      return <FaUserEdit className="text-teal-500" />
    } else {
      return <FaHistory className="text-gray-500" />
    }
  }

  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        <Link to="/admin/audit-logs" className="text-sm text-teal-600 hover:text-teal-800">
          View All
        </Link>
      </div>
      <div className="p-4">
        {recentLogs && recentLogs.length > 0 ? (
          <div className="space-y-4">
            {recentLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start">
                <div className="p-2 rounded-full bg-gray-100 mr-3">{getActionIcon(log.action)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{log.details}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">User ID: {log.user_id}</p>
                    <p className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAuditLogWidget
