import { FaHome, FaUsers } from "react-icons/fa"
import { Link } from "react-router-dom"

const AdminCommunityWidget = ({ communityStats }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Community Statistics</h2>
        <Link to="/admin/communities" className="text-sm text-teal-600 hover:text-teal-800">
          View All
        </Link>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <FaHome className="text-green-500 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Communities</p>
                <p className="text-xl font-semibold">{communityStats?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <FaUsers className="text-blue-500 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Communities</p>
                <p className="text-xl font-semibold">{communityStats?.active || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">Community Health</h3>
          <div className="bg-gray-100 h-4 rounded-full overflow-hidden">
            <div
              className="bg-teal-500 h-full"
              style={{
                width: `${
                  communityStats?.active && communityStats?.total
                    ? (communityStats.active / communityStats.total) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {communityStats?.active || 0} out of {communityStats?.total || 0} communities are active
          </p>
        </div>

        <div className="mt-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/communities/create"
              className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm hover:bg-teal-200"
            >
              Create Community
            </Link>
            <Link
              to="/admin/communities?filter=inactive"
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200"
            >
              View Inactive
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCommunityWidget
