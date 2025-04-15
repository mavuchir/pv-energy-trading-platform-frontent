import { FaUsers, FaUserCheck, FaUserShield } from "react-icons/fa"
import { Link } from "react-router-dom"

const AdminUserWidget = ({ userStats }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">User Statistics</h2>
        <Link to="/admin/users" className="text-sm text-teal-600 hover:text-teal-800">
          View All
        </Link>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <FaUsers className="text-blue-500 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-xl font-semibold">{userStats?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <FaUserCheck className="text-green-500 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-xl font-semibold">{userStats?.active || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <FaUserShield className="text-purple-500 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Admin Users</p>
                <p className="text-xl font-semibold">{userStats?.admin || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/users/create"
              className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm hover:bg-teal-200"
            >
              Add User
            </Link>
            <Link
              to="/admin/users?filter=inactive"
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200"
            >
              View Inactive
            </Link>
            <Link
              to="/admin/users?filter=locked"
              className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200"
            >
              View Locked
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUserWidget
