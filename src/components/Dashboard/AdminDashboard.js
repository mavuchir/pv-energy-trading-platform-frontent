import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaBolt, 
  FaExchangeAlt, 
  FaChartLine, 
  FaSync, 
  FaUserShield, 
  FaServer, 
  FaHistory 
} from 'react-icons/fa';

const AdminDashboard = ({ dashboardData, refreshing, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <FaSync className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Users */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {dashboardData?.user_stats?.total || 42}
                    </div>
                    <div className="text-sm text-gray-500">
                      {dashboardData?.user_stats?.active || 38} active
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/admin/users" className="font-medium text-teal-600 hover:text-teal-500">
                View all users
              </Link>
            </div>
          </div>
        </div>

        {/* Energy Production */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <FaBolt className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Energy Production</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {dashboardData?.system_stats?.total_solar_capacity?.toFixed(2) || '125.5'} kW
                    </div>
                    <div className="text-sm text-gray-500">
                      System capacity
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/admin/energy" className="font-medium text-teal-600 hover:text-teal-500">
                View energy stats
              </Link>
            </div>
          </div>
        </div>

        {/* Market */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <FaExchangeAlt className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Current Market Price</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      ${dashboardData?.current_market_price || '0.1542'}/kWh
                    </div>
                    <div className="text-sm text-gray-500">
                      Last updated: {new Date().toLocaleTimeString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/admin/market" className="font-medium text-teal-600 hover:text-teal-500">
                Manage market
              </Link>
            </div>
          </div>
        </div>

        {/* Communities */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <FaUsers className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Communities</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {dashboardData?.community_stats?.total || 8}
                    </div>
                    <div className="text-sm text-gray-500">
                      {dashboardData?.community_stats?.active || 7} active
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/admin/communities" className="font-medium text-teal-600 hover:text-teal-500">
                Manage communities
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/admin/users"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <FaUserShield className="mr-2" /> Manage Users
            </Link>
            <Link
              to="/admin/settings"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaServer className="mr-2" /> System Settings
            </Link>
            <Link
              to="/admin/logs"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <FaHistory className="mr-2" /> View Audit Logs
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {(dashboardData?.recent_logs || []).map((log, index) => (
              <li key={log.id || index} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-teal-600 truncate">{log.action}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <FaUserShield className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      User ID: {log.user_id}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      {log.details}
                    </p>
                  </div>
                </div>
              </li>
            ))}
            {(!dashboardData?.recent_logs || dashboardData.recent_logs.length === 0) && (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No recent activity
              </li>
            )}
          </ul>
        </div>
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link to="/admin/logs" className="font-medium text-teal-600 hover:text-teal-500">
              View all logs <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <FaChartLine className="mr-2 text-teal-500" /> System Statistics
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Solar Capacity</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {dashboardData?.system_stats?.total_solar_capacity?.toFixed(2) || '125.5'} kW
              </dd>
            </div>
            <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Battery Capacity</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {dashboardData?.system_stats?.total_battery_capacity?.toFixed(2) || '250.0'} kWh
              </dd>
            </div>
            <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Active Trades</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {dashboardData?.active_trades || 24}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;