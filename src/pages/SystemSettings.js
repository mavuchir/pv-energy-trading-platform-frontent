"use client"

import { useState, useEffect } from "react"
import {
  FaCog,
  FaServer,
  FaDatabase,
  FaNetworkWired,
  FaSave,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa"
import AdminService from "../services/AdminService"

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState("general")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [settings, setSettings] = useState({
    general: {
      systemName: "Energy Trading Platform",
      maintenanceMode: false,
      debugMode: false,
      defaultLanguage: "en",
      defaultTimezone: "UTC",
    },
    server: {
      maxConnections: 1000,
      connectionTimeout: 30,
      requestTimeout: 60,
      maxUploadSize: 10,
      enableCompression: true,
      enableCaching: true,
    },
    database: {
      connectionPoolSize: 20,
      maxQueryTime: 5,
      backupFrequency: "daily",
      backupRetention: 7,
      logQueries: false,
    },
    api: {
      rateLimit: 100,
      rateLimitWindow: 60,
      enableCors: true,
      allowedOrigins: "*",
      apiKeys: true,
      jwtExpiration: 24,
    },
  })

  useEffect(() => {
    fetchSystemSettings()
  }, [])

  const fetchSystemSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await AdminService.getSystemSettings()
      setSettings(response)
    } catch (err) {
      console.error("Error fetching system settings:", err)
      setError("Failed to load system settings. Using default values.")
      // Continue with default settings
    } finally {
      setLoading(false)
    }
  }

  const handleChangeSettings = (category, setting, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value,
      },
    })
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      await AdminService.updateSystemSettings(settings)

      setSuccess("System settings saved successfully")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error saving system settings:", err)
      setError("Failed to save system settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderGeneralSettings = () => (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">System Name</label>
        <input
          type="text"
          value={settings.general.systemName}
          onChange={(e) => handleChangeSettings("general", "systemName", e.target.value)}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Maintenance Mode</label>
            <p className="text-xs text-gray-500 mt-1">When enabled, only administrators can access the system</p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="maintenance-mode"
              checked={settings.general.maintenanceMode}
              onChange={(e) => handleChangeSettings("general", "maintenanceMode", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="maintenance-mode"
              className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                settings.general.maintenanceMode ? "bg-teal-500" : ""
              }`}
            >
              <span
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.general.maintenanceMode ? "transform translate-x-6" : ""
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Debug Mode</label>
            <p className="text-xs text-gray-500 mt-1">Enable detailed error messages and logging</p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="debug-mode"
              checked={settings.general.debugMode}
              onChange={(e) => handleChangeSettings("general", "debugMode", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="debug-mode"
              className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                settings.general.debugMode ? "bg-teal-500" : ""
              }`}
            >
              <span
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.general.debugMode ? "transform translate-x-6" : ""
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
        <select
          value={settings.general.defaultLanguage}
          onChange={(e) => handleChangeSettings("general", "defaultLanguage", e.target.value)}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="zh">Chinese</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Default Timezone</label>
        <select
          value={settings.general.defaultTimezone}
          onChange={(e) => handleChangeSettings("general", "defaultTimezone", e.target.value)}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          <option value="UTC">UTC</option>
          <option value="EST">Eastern Time</option>
          <option value="CST">Central Time</option>
          <option value="MST">Mountain Time</option>
          <option value="PST">Pacific Time</option>
        </select>
      </div>
    </div>
  )

  const renderServerSettings = () => (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Connections</label>
        <input
          type="number"
          min="100"
          max="10000"
          value={settings.server.maxConnections}
          onChange={(e) => handleChangeSettings("server", "maxConnections", Number(e.target.value))}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <p className="text-xs text-gray-500 mt-1">Maximum number of simultaneous connections</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Connection Timeout (seconds)</label>
        <input
          type="number"
          min="5"
          max="300"
          value={settings.server.connectionTimeout}
          onChange={(e) => handleChangeSettings("server", "connectionTimeout", Number(e.target.value))}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Request Timeout (seconds)</label>
        <input
          type="number"
          min="10"
          max="600"
          value={settings.server.requestTimeout}
          onChange={(e) => handleChangeSettings("server", "requestTimeout", Number(e.target.value))}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Upload Size (MB)</label>
        <input
          type="number"
          min="1"
          max="100"
          value={settings.server.maxUploadSize}
          onChange={(e) => handleChangeSettings("server", "maxUploadSize", Number(e.target.value))}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Enable Compression</label>
            <p className="text-xs text-gray-500 mt-1">Compress responses to reduce bandwidth usage</p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="enable-compression"
              checked={settings.server.enableCompression}
              onChange={(e) => handleChangeSettings("server", "enableCompression", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="enable-compression"
              className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                settings.server.enableCompression ? "bg-teal-500" : ""
              }`}
            >
              <span
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.server.enableCompression ? "transform translate-x-6" : ""
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Enable Caching</label>
            <p className="text-xs text-gray-500 mt-1">Cache responses to improve performance</p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="enable-caching"
              checked={settings.server.enableCaching}
              onChange={(e) => handleChangeSettings("server", "enableCaching", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="enable-caching"
              className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                settings.server.enableCaching ? "bg-teal-500" : ""
              }`}
            >
              <span
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.server.enableCaching ? "transform translate-x-6" : ""
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDatabaseSettings = () => (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Connection Pool Size</label>
        <input
          type="number"
          min="5"
          max="100"
          value={settings.database.connectionPoolSize}
          onChange={(e) => handleChangeSettings("database", "connectionPoolSize", Number(e.target.value))}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <p className="text-xs text-gray-500 mt-1">Number of database connections to maintain</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Query Time (seconds)</label>
        <input
          type="number"
          min="1"
          max="60"
          value={settings.database.maxQueryTime}
          onChange={(e) => handleChangeSettings("database", "maxQueryTime", Number(e.target.value))}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <p className="text-xs text-gray-500 mt-1">Maximum time a query can run before timing out</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
        <select
          value={settings.database.backupFrequency}
          onChange={(e) => handleChangeSettings("database", "backupFrequency", e.target.value)}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Backup Retention (days)</label>
        <input
          type="number"
          min="1"
          max="365"
          value={settings.database.backupRetention}
          onChange={(e) => handleChangeSettings("database", "backupRetention", Number(e.target.value))}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <p className="text-xs text-gray-500 mt-1">Number of days to keep backups</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Log Queries</label>
            <p className="text-xs text-gray-500 mt-1">Log all database queries for debugging</p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="log-queries"
              checked={settings.database.logQueries}
              onChange={(e) => handleChangeSettings("database", "logQueries", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="log-queries"
              className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                settings.database.logQueries ? "bg-teal-500" : ""
              }`}
            >
              <span
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.database.logQueries ? "transform translate-x-6" : ""
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderApiSettings = () => (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Rate Limit (requests per window)</label>
        <input
          type="number"
          min="10"
          max="1000"
          value={settings.api.rateLimit}
          onChange={(e) => handleChangeSettings("api", "rateLimit", Number(e.target.value))}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Rate Limit Window (seconds)</label>
        <input
          type="number"
          min="10"
          max="3600"
          value={settings.api.rateLimitWindow}
          onChange={(e) => handleChangeSettings("api", "rateLimitWindow", Number(e.target.value))}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Enable CORS</label>
            <p className="text-xs text-gray-500 mt-1">Allow cross-origin requests to the API</p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="enable-cors"
              checked={settings.api.enableCors}
              onChange={(e) => handleChangeSettings("api", "enableCors", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="enable-cors"
              className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                settings.api.enableCors ? "bg-teal-500" : ""
              }`}
            >
              <span
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.api.enableCors ? "transform translate-x-6" : ""
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Origins</label>
        <input
          type="text"
          value={settings.api.allowedOrigins}
          onChange={(e) => handleChangeSettings("api", "allowedOrigins", e.target.value)}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <p className="text-xs text-gray-500 mt-1">Comma-separated list of allowed origins, or * for all</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Require API Keys</label>
            <p className="text-xs text-gray-500 mt-1">Require API keys for all API requests</p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="api-keys"
              checked={settings.api.apiKeys}
              onChange={(e) => handleChangeSettings("api", "apiKeys", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="api-keys"
              className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                settings.api.apiKeys ? "bg-teal-500" : ""
              }`}
            >
              <span
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.api.apiKeys ? "transform translate-x-6" : ""
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">JWT Expiration (hours)</label>
        <input
          type="number"
          min="1"
          max="720"
          value={settings.api.jwtExpiration}
          onChange={(e) => handleChangeSettings("api", "jwtExpiration", Number(e.target.value))}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <p className="text-xs text-gray-500 mt-1">How long JWT tokens are valid</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-teal-600">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and parameters</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-red-600">
              <FaExclamationTriangle className="mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-green-600">
              <FaCheckCircle className="mr-2" />
              <p>{success}</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4">
            <div className="bg-gray-50 p-4 border-r border-gray-200">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("general")}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === "general" ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaCog className={`mr-3 ${activeTab === "general" ? "text-teal-500" : "text-gray-400"}`} />
                  General
                </button>
                <button
                  onClick={() => setActiveTab("server")}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === "server" ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaServer className={`mr-3 ${activeTab === "server" ? "text-teal-500" : "text-gray-400"}`} />
                  Server
                </button>
                <button
                  onClick={() => setActiveTab("database")}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === "database" ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaDatabase className={`mr-3 ${activeTab === "database" ? "text-teal-500" : "text-gray-400"}`} />
                  Database
                </button>
                <button
                  onClick={() => setActiveTab("api")}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === "api" ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaNetworkWired className={`mr-3 ${activeTab === "api" ? "text-teal-500" : "text-gray-400"}`} />
                  API
                </button>
              </nav>
            </div>

            <div className="p-6 col-span-3">
              <h2 className="text-xl font-medium text-gray-800 mb-6">
                {activeTab === "general" && "General Settings"}
                {activeTab === "server" && "Server Settings"}
                {activeTab === "database" && "Database Settings"}
                {activeTab === "api" && "API Settings"}
              </h2>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
              ) : (
                <>
                  {activeTab === "general" && renderGeneralSettings()}
                  {activeTab === "server" && renderServerSettings()}
                  {activeTab === "database" && renderDatabaseSettings()}
                  {activeTab === "api" && renderApiSettings()}

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleSaveSettings}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          Save Settings
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings
