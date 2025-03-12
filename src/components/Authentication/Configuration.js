"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaSolarPanel,
  FaBatteryFull,
  FaPlug,
  FaArrowRight,
  FaArrowLeft,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaLightbulb,
  FaTrash,
  FaPlus,
} from "react-icons/fa"
import axios from "axios"

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Common appliance presets for quick selection
const APPLIANCE_PRESETS = [
  { name: "Refrigerator", power_consumption: 150, daily_usage_hours: 24 },
  { name: "Washing Machine", power_consumption: 500, daily_usage_hours: 1 },
  { name: "Air Conditioner", power_consumption: 1500, daily_usage_hours: 6 },
  { name: "TV", power_consumption: 100, daily_usage_hours: 4 },
  { name: "Laptop", power_consumption: 50, daily_usage_hours: 8 },
  { name: "Oven", power_consumption: 2400, daily_usage_hours: 1 },
  { name: "Microwave", power_consumption: 1000, daily_usage_hours: 0.5 },
  { name: "Dishwasher", power_consumption: 1200, daily_usage_hours: 1 },
  { name: "Lighting", power_consumption: 60, daily_usage_hours: 5 },
  { name: "Water Heater", power_consumption: 4000, daily_usage_hours: 3 },
]

const Configuration = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    solar_capacity: 5.0,
    panel_efficiency: 0.85,
    battery_capacity: 10.0,
    battery_efficiency: 0.9,
    grid_connection: true,
    latitude: "",
    longitude: "",
    location: "",
  })
  const [appliances, setAppliances] = useState([
    { name: "Refrigerator", power_consumption: 150, daily_usage_hours: 24 },
    { name: "Lighting", power_consumption: 60, daily_usage_hours: 5 },
  ])
  const [newAppliance, setNewAppliance] = useState({
    name: "",
    power_consumption: 0,
    daily_usage_hours: 0,
  })
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      setLocationLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }))
          setLocationLoading(false)
          fetchWeatherData(position.coords.latitude, position.coords.longitude)
          // Also try to get location name from coordinates
          fetchLocationName(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          console.error("Error getting location:", error)
          setLocationLoading(false)
        },
      )
    }
  }, [])

  const fetchLocationName = async (lat, lon) => {
    try {
      // This is a simplified example - in a real app, you'd use a geocoding service
      setFormData((prev) => ({
        ...prev,
        location: `Location at ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      }))
    } catch (error) {
      console.error("Error fetching location name:", error)
    }
  }

  const fetchWeatherData = async (lat, lon) => {
    if (!lat || !lon) return

    try {
      const tempData = { latitude: lat, longitude: lon }
      const response = await api.post("/weather/temp-data", tempData)
      setWeatherData(response.data)
    } catch (error) {
      console.error("Error fetching weather data:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === "checkbox" ? checked : type === "number" ? Number.parseFloat(value) : value

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // If latitude or longitude changed, fetch weather data
    if ((name === "latitude" || name === "longitude") && formData.latitude && formData.longitude) {
      fetchWeatherData(
        name === "latitude" ? newValue : formData.latitude,
        name === "longitude" ? newValue : formData.longitude,
      )
    }
  }

  const handleNewApplianceChange = (e) => {
    const { name, value } = e.target
    const newValue = name === "name" ? value : Number.parseFloat(value)

    setNewAppliance((prev) => ({
      ...prev,
      [name]: newValue,
    }))
  }

  const addAppliance = () => {
    if (!newAppliance.name || newAppliance.power_consumption <= 0 || newAppliance.daily_usage_hours <= 0) {
      setError("Please fill in all appliance fields with valid values")
      return
    }

    if (newAppliance.daily_usage_hours > 24) {
      setError("Daily usage hours cannot exceed 24")
      return
    }

    setAppliances([...appliances, { ...newAppliance }])
    setNewAppliance({
      name: "",
      power_consumption: 0,
      daily_usage_hours: 0,
    })
    setError(null)
  }

  const removeAppliance = (index) => {
    const updatedAppliances = [...appliances]
    updatedAppliances.splice(index, 1)
    setAppliances(updatedAppliances)
  }

  const addPresetAppliance = (preset) => {
    // Check if this preset already exists in the appliances list
    const exists = appliances.some((app) => app.name === preset.name)
    if (!exists) {
      setAppliances([...appliances, { ...preset }])
    } else {
      setError(`A ${preset.name} is already in your appliance list`)
    }
  }

  const calculateTotalConsumption = () => {
    return appliances.reduce((total, appliance) => {
      // Energy (kWh) = Power (W) × Hours / 1000
      const dailyEnergy = (appliance.power_consumption * appliance.daily_usage_hours) / 1000
      return total + dailyEnergy
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step < 4) {
      setStep(step + 1)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // First save the household configuration
      const configResponse = await api.post("/household/configuration", formData)
      console.log("Configuration response:", configResponse.data)

      // Then add all appliances
      for (const appliance of appliances) {
        await api.post("/appliance/add", appliance)
      }

      // Navigate to dashboard after successful configuration
      navigate("/dashboard")
    } catch (err) {
      console.error("Configuration error:", err)
      setError(err.response?.data?.msg || "Failed to configure household. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4 text-teal-600">
              <FaSolarPanel className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-bold">Solar System Configuration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Solar Capacity (kW)</label>
                <input
                  type="number"
                  name="solar_capacity"
                  value={formData.solar_capacity}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">The total capacity of your solar panels in kilowatts</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Panel Efficiency (0-1)</label>
                <input
                  type="number"
                  name="panel_efficiency"
                  value={formData.panel_efficiency}
                  onChange={handleChange}
                  min="0"
                  max="1"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">The efficiency rating of your solar panels</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="h-4 w-4 mr-1" />
                    <span>Location Coordinates</span>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                    <input
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      step="0.000001"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                    <input
                      type="number"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      step="0.000001"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 mb-1">Location Name</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter your location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {locationLoading ? "Detecting your location..." : "Your geographical coordinates for weather data"}
                </p>
              </div>
              {weatherData && (
                <div className="bg-blue-50 p-4 rounded-md mt-4">
                  <h3 className="font-medium text-blue-800">Current Weather Conditions</h3>
                  <p className="text-sm text-blue-700">Temperature: {weatherData.temperature}°C</p>
                  <p className="text-sm text-blue-700">Cloud Cover: {weatherData.cloud_cover}%</p>
                  <p className="text-sm text-blue-700">Solar Irradiance: {weatherData.irradiance} W/m²</p>
                  {weatherData.weather_description && (
                    <p className="text-sm text-blue-700">Conditions: {weatherData.weather_description}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4 text-teal-600">
              <FaBatteryFull className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-bold">Battery Storage Configuration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Battery Capacity (kWh)</label>
                <input
                  type="number"
                  name="battery_capacity"
                  value={formData.battery_capacity}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The total capacity of your battery storage in kilowatt-hours
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Battery Efficiency (0-1)</label>
                <input
                  type="number"
                  name="battery_efficiency"
                  value={formData.battery_efficiency}
                  onChange={handleChange}
                  min="0"
                  max="1"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">The round-trip efficiency of your battery storage system</p>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4 text-teal-600">
              <FaLightbulb className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-bold">Appliance Configuration</h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Add the appliances in your household to calculate energy consumption patterns.
              </p>

              {/* Current appliances list */}
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-2">Your Appliances</h3>
                {appliances.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No appliances added yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Appliance
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Power (W)
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Hours/Day
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            kWh/Day
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {appliances.map((appliance, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{appliance.name}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {appliance.power_consumption}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {appliance.daily_usage_hours}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {((appliance.power_consumption * appliance.daily_usage_hours) / 1000).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              <button
                                type="button"
                                onClick={() => removeAppliance(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50">
                          <td
                            colSpan="3"
                            className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right"
                          >
                            Total Daily Consumption:
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {calculateTotalConsumption().toFixed(2)} kWh
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add new appliance form */}
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="text-md font-medium text-gray-700 mb-2">Add New Appliance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Appliance Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newAppliance.name}
                      onChange={handleNewApplianceChange}
                      placeholder="e.g., Refrigerator"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Power Consumption (W)</label>
                    <input
                      type="number"
                      name="power_consumption"
                      value={newAppliance.power_consumption}
                      onChange={handleNewApplianceChange}
                      min="0"
                      step="1"
                      placeholder="e.g., 150"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Daily Usage (hours)</label>
                    <input
                      type="number"
                      name="daily_usage_hours"
                      value={newAppliance.daily_usage_hours}
                      onChange={handleNewApplianceChange}
                      min="0"
                      max="24"
                      step="0.5"
                      placeholder="e.g., 24"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addAppliance}
                  className="mt-3 flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
                >
                  <FaPlus className="mr-2" /> Add Appliance
                </button>
              </div>

              {/* Quick add presets */}
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-2">Quick Add Common Appliances</h3>
                <div className="flex flex-wrap gap-2">
                  {APPLIANCE_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addPresetAppliance(preset)}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-xs font-medium text-gray-800 transition-colors duration-200"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4 text-teal-600">
              <FaPlug className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-bold">Grid Connection</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Connect to Grid</label>
                  <p className="text-xs text-gray-500">
                    Enable to connect your system to the power grid for energy trading
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="grid_connection"
                    checked={formData.grid_connection}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">Configuration Summary</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Solar Capacity:</strong> {formData.solar_capacity} kW
                  </li>
                  <li>
                    <strong>Panel Efficiency:</strong> {formData.panel_efficiency}
                  </li>
                  <li>
                    <strong>Battery Capacity:</strong> {formData.battery_capacity} kWh
                  </li>
                  <li>
                    <strong>Battery Efficiency:</strong> {formData.battery_efficiency}
                  </li>
                  <li>
                    <strong>Grid Connection:</strong> {formData.grid_connection ? "Enabled" : "Disabled"}
                  </li>
                  <li>
                    <strong>Location:</strong>{" "}
                    {formData.location ||
                      (formData.latitude
                        ? `${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}`
                        : "Not set")}
                  </li>
                  <li>
                    <strong>Appliances:</strong> {appliances.length} configured
                  </li>
                  <li>
                    <strong>Daily Consumption:</strong> {calculateTotalConsumption().toFixed(2)} kWh
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-teal-600">Household Energy System Setup</h1>
          <p className="text-gray-600">Configure your energy system to get started</p>

          {/* Progress indicator */}
          <div className="flex justify-between items-center mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${(step / 4) * 100}%` }}></div>
            </div>
            <span className="ml-4 text-sm font-medium text-gray-700">Step {step} of 4</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4 flex items-start">
            <FaExclamationTriangle className="h-5 w-5 mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          <div className="mt-6 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
              >
                <FaArrowLeft className="mr-2" /> Previous
              </button>
            )}

            <button
              type="submit"
              className={`flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 disabled:opacity-50 ${step === 1 ? "ml-auto" : ""}`}
              disabled={loading}
            >
              {step < 4 ? (
                <>
                  Next <FaArrowRight className="ml-2" />
                </>
              ) : loading ? (
                "Configuring..."
              ) : (
                "Complete Setup"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Configuration

