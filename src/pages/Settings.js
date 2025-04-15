"use client"

import { useState, useEffect } from "react"
import {
  FaCog,
  FaBell,
  FaShieldAlt,
  FaExchangeAlt,
  FaSolarPanel,
  FaSave,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa"
import AdminService from "../services/AdminService"
import { useAuth } from "../contexts/AuthContext"

const Settings = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState({
    general: {
      theme: "light",
      language: "en",
      timeZone: "UTC",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
    },
    privacy: {
      shareEnergyData: true,
      shareTradingHistory: true,
      shareLocationData: false,
      allowAnonymousAnalytics: true,
      showProfileInCommunity: true,
    },
    energy: {
      preferredEnergyUnit: "kWh",
      batterySafetyThreshold: 20,
      autoSellThreshold: 80,
      autoBuyThreshold: 30,
      maximumBuyPrice: 0.15,
      minimumSellPrice: 0.1,
    },
    trading: {
      autoAcceptTrades: false,
      tradingEnabled: true,
      preferLocalTrades: true,
      maximumTradeDistance: 50,
      minimumTradeAmount: 1,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      lowBatteryAlerts: true,
      highProductionAlerts: true,
      tradingOpportunities: true,
      systemUpdates: true,
      weeklyReports: true,
    },
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await AdminService.getSystemSettings()

      // Merge with default settings to ensure we have all fields
      setSettings({
        ...settings,
        ...response.data,
      })
    } catch (err) {
      console.error("Error fetching settings:", err)
      setError("Failed to load settings. Using default values.")
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

      setSuccess("Settings saved successfully")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error saving settings:", err)
      setError("Failed to save settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderGeneralSettings = () => (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
        <select
          value={settings.general.theme}
          onChange={(e) => handleChangeSettings("general", "theme", e.target.value)}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System Default</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
        <select
          value={settings.general.language}
          onChange={(e) => handleChangeSettings("general", "language", e.target.value)}
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
        <select
          value={settings.general.timeZone}
          onChange={(e) => handleChangeSettings("general", "timeZone", e.target.value)}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          <option value="UTC">UTC</option>
          <option value="EST">Eastern Time</option>
          <option value="CST">Central Time</option>
          <option value="MST">Mountain Time</option>
          <option value="PST">Pacific Time</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
        <select
          value={settings.general.dateFormat}
          onChange={(e) => handleChangeSettings("general", "dateFormat", e.target.value)}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
        <select
          value={settings.general.timeFormat}
          onChange={(e) => handleChangeSettings("general", "timeFormat", e.target.value)}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          <option value="12h">12-hour (AM/PM)</option>
          <option value="24h">24-hour</option>
        </select>
      </div>
    </div>
  )

  const renderPrivacySettings = () => (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Share Energy Data</label>
            <p className="text-xs text-gray-500 mt-1">
              Allow your energy production and consumption data to be shared anonymously for community benchmarking
            </p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="share-energy-data"
              checked={settings.privacy.shareEnergyData}
              onChange={(e) => handleChangeSettings("privacy", "shareEnergyData", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="share-energy-data"
              className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                settings.privacy.shareEnergyData ? "bg-teal-500" : ""
              }`}
            >
              <span
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.privacy.shareEnergyData ? "transform translate-x-6" : ""
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Share Trading History</label>
            <p className="text-xs text-gray-500 mt-1">
              Allow your trading history to be shared anonymously to improve market recommendations
            </p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="share-trading-history"
              checked={settings.privacy.shareTradingHistory}
              onChange={(e) => handleChangeSettings("privacy", "shareTradingHistory", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="share-trading-history"
              className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                settings.privacy.shareTradingHistory ? "bg-teal-500" : ""
              }`}
            >
              <span
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.privacy.shareTradingHistory ? "transform translate-x-6" : ""
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Share Location Data</label>
            <p className="text-xs text-gray-500 mt-1">
              Share your approximate location to find local trading opportunities
            </p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="share-location-data"
              checked={settings.privacy.shareLocationData}
              onChange={(e) => handleChangeSettings("privacy", "shareLocationData", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="share-location-data"
              className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                settings.privacy.shareLocationData ? "bg-teal-500" : ""
              }`}
            >
              <span
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.privacy.shareLocationData ? "transform translate-x-6" : ""
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Allow Anonymous Analytics</label>
            <p className="text-xs text-gray-500 mt-1">
              Allow usage data to be collected anonymously to improve the system
            </p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="allow-analytics"
              checked={settings.privacy.allowAnonymousAnalytics}
              onChange={(e) => handleChangeSettings("privacy", "allowAnonymousAnalytics", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="allow-analytics"
              className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                settings.privacy.allowAnonymousAnalytics ? "bg-teal-500" : ""
              }`}
            >
              <span
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.privacy.allowAnonymousAnalytics ? "transform translate-x-6" : ""
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Show Profile in Community</label>
            <p className="text-xs text-gray-500 mt-1">
              Make your profile visible to other members of your energy community
            </p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="show-profile"
              checked={settings.privacy.showProfileInCommunity}
              onChange={(e) => handleChangeSettings("privacy", "showProfileInCommunity", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="show-profile"
              className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                settings.privacy.showProfileInCommunity ? "bg-teal-500" : ""
              }`}
            >
              <span
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.privacy.showProfileInCommunity ? "transform translate-x-6" : ""
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEnergySettings = () => (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Energy Unit</label>
        <select
          value={settings.energy.preferredEnergyUnit}
          onChange={(e) => handleChangeSettings("energy", "preferredEnergyUnit", e.target.value)}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          <option value="kWh">kilowatt-hour (kWh)</option>
          <option value="MWh">megawatt-hour (MWh)</option>
          <option value="Wh">watt-hour (Wh)</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Battery Safety Threshold (%)</label>
        <div className="flex items-center">
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={settings.energy.batterySafetyThreshold}
            onChange={(e) => handleChangeSettings("energy", "batterySafetyThreshold", Number.parseInt(e.target.value))}
            className="flex-grow mr-4 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="inline-block w-12 text-center bg-gray-100 rounded-md py-1 text-gray-700 text-sm">
            {settings.energy.batterySafetyThreshold}%
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          System will alert you when battery level falls below this threshold
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Sell Threshold (%)</label>
        <div className="flex items-center">
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={settings.energy.autoSellThreshold}
            onChange={(e) => handleChangeSettings("energy", "autoSellThreshold", Number.parseInt(e.target.value))}
            className="flex-grow mr-4 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="inline-block w-12 text-center bg-gray-100 rounded-md py-1 text-gray-700 text-sm">
            {settings.energy.autoSellThreshold}%
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          System will automatically sell excess energy when battery level exceeds this threshold
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Buy Threshold (%)</label>
        <div className="flex items-center">
          <input
            type="range"
            min="10"
            max="50"
            step="5"
            value={settings.energy.autoBuyThreshold}
            onChange={(e) => handleChangeSettings("energy", "autoBuyThreshold", Number.parseInt(e.target.value))}
            className="flex-grow mr-4 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="inline-block w-12 text-center bg-gray-100 rounded-md py-1 text-gray-700 text-sm">
            {settings.energy.autoBuyThreshold}%
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          System will automatically buy energy when battery level falls below this threshold
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Buy Price ($/kWh)</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={settings.energy.maximumBuyPrice}
            onChange={(e) => handleChangeSettings("energy", "maximumBuyPrice", Number.parseFloat(e.target.value))}
            className="pl-7 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">System will not automatically purchase energy above this price</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Sell Price ($/kWh)</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={settings.energy.minimumSellPrice}
            onChange={(e) => handleChangeSettings("energy", "minimumSellPrice", Number.parseFloat(e.target.value))}
            className="pl-7 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">System will not automatically sell energy below this price</p>
      </div>
    </div>
  )

  const renderTradingSettings = () => (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Enable Trading</label>
            <p className="text-xs text-gray-500 mt-1">Allow your system to participate in energy trading</p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="trading-enabled"
              checked={settings.trading.tradingEnabled}
              onChange={(e) => handleChangeSettings("trading", "tradingEnabled", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="trading-enabled"
              className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                settings.trading.tradingEnabled ? "bg-teal-500" : ""
              }`}
            >
              <span
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.trading.tradingEnabled ? "transform translate-x-6" : ""
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Auto-Accept Trades</label>
            <p className="text-xs text-gray-500 mt-1">Automatically accept trades that meet your criteria</p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="auto-accept-trades"
              checked={settings.trading.autoAcceptTrades}
              onChange={(e) => handleChangeSettings("trading", "autoAcceptTrades", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="auto-accept-trades"
              className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                settings.trading.autoAcceptTrades ? "bg-teal-500" : ""
              }`}
            >
              <span
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.trading.autoAcceptTrades ? "transform translate-x-6" : ""
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Prefer Local Trades</label>
            <p className="text-xs text-gray-500 mt-1">Prioritize trading with households in your vicinity</p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="prefer-local-trades"
              checked={settings.trading.preferLocalTrades}
              onChange={(e) => handleChangeSettings("trading", "preferLocalTrades", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="prefer-local-trades"
              className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                settings.trading.preferLocalTrades ? "bg-teal-500" : ""
              }`}
            >
              <span
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  settings.trading.preferLocalTrades ? "transform translate-x-6" : ""
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Trade Distance (km)</label>
        <input
          type="number"
          min="1"
          max="1000"
          value={settings.trading.maximumTradeDistance}
          onChange={(e) => handleChangeSettings("trading", "maximumTradeDistance", Number.parseInt(e.target.value))}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <p className="text-xs text-gray-500 mt-1">Maximum distance for trading partners (in kilometers)</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Trade Amount (kWh)</label>
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={settings.trading.minimumTradeAmount}
          onChange={(e) => handleChangeSettings("trading", "minimumTradeAmount", Number.parseFloat(e.target.value))}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <p className="text-xs text-gray-500 mt-1">Minimum amount of energy for each trade</p>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-3">Notification Channels</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="email-notifications"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => handleChangeSettings("notifications", "emailNotifications", e.target.checked)}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
              Email Notifications
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="push-notifications"
              checked={settings.notifications.pushNotifications}
              onChange={(e) => handleChangeSettings("notifications", "pushNotifications", e.target.checked)}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-700">
              Push Notifications
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sms-notifications"
              checked={settings.notifications.smsNotifications}
              onChange={(e) => handleChangeSettings("notifications", "smsNotifications", e.target.checked)}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="sms-notifications" className="ml-2 block text-sm text-gray-700">
              SMS Notifications
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-3">Notification Types</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="low-battery-alerts"
              checked={settings.notifications.lowBatteryAlerts}
              onChange={(e) => handleChangeSettings("notifications", "lowBatteryAlerts", e.target.checked)}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="low-battery-alerts" className="ml-2 block text-sm text-gray-700">
              Low Battery Alerts
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="high-production-alerts"
              checked={settings.notifications.highProductionAlerts}
              onChange={(e) => handleChangeSettings("notifications", "highProductionAlerts", e.target.checked)}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="high-production-alerts" className="ml-2 block text-sm text-gray-700">
              High Production Alerts
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="trading-opportunities"
              checked={settings.notifications.tradingOpportunities}
              onChange={(e) => handleChangeSettings("notifications", "tradingOpportunities", e.target.checked)}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="trading-opportunities" className="ml-2 block text-sm text-gray-700">
              Trading Opportunities
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="system-updates"
              checked={settings.notifications.systemUpdates}
              onChange={(e) => handleChangeSettings("notifications", "systemUpdates", e.target.checked)}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="system-updates" className="ml-2 block text-sm text-gray-700">
              System Updates
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="weekly-reports"
              checked={settings.notifications.weeklyReports}
              onChange={(e) => handleChangeSettings("notifications", "weeklyReports", e.target.checked)}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="weekly-reports" className="ml-2 block text-sm text-gray-700">
              Weekly Energy Reports
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-teal-600">Settings</h1>
          <p className="text-gray-600">Configure your system preferences and options</p>
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
                  onClick={() => setActiveTab("privacy")}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === "privacy" ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaShieldAlt className={`mr-3 ${activeTab === "privacy" ? "text-teal-500" : "text-gray-400"}`} />
                  Privacy
                </button>
                <button
                  onClick={() => setActiveTab("energy")}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === "energy" ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaSolarPanel className={`mr-3 ${activeTab === "energy" ? "text-teal-500" : "text-gray-400"}`} />
                  Energy
                </button>
                <button
                  onClick={() => setActiveTab("trading")}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === "trading" ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaExchangeAlt className={`mr-3 ${activeTab === "trading" ? "text-teal-500" : "text-gray-400"}`} />
                  Trading
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === "notifications" ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaBell className={`mr-3 ${activeTab === "notifications" ? "text-teal-500" : "text-gray-400"}`} />
                  Notifications
                </button>
              </nav>
            </div>

            <div className="p-6 col-span-3">
              <h2 className="text-xl font-medium text-gray-800 mb-6">
                {activeTab === "general" && "General Settings"}
                {activeTab === "privacy" && "Privacy Settings"}
                {activeTab === "energy" && "Energy Settings"}
                {activeTab === "trading" && "Trading Settings"}
                {activeTab === "notifications" && "Notification Settings"}
              </h2>

              {activeTab === "general" && renderGeneralSettings()}
              {activeTab === "privacy" && renderPrivacySettings()}
              {activeTab === "energy" && renderEnergySettings()}
              {activeTab === "trading" && renderTradingSettings()}
              {activeTab === "notifications" && renderNotificationSettings()}

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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
