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
        },
        (error) => {
          console.error("Error getting location:", error)
          setLocationLoading(false)
        },
      )
    }
  }, [])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await api.post("/household/configure", formData)
      console.log("Configuration response:", response.data)

      // Navigate to dashboard after successful configuration
      if (response.data.user) {
        navigate("/dashboard")
      } else {
        setError("Unexpected response from the server.")
      }
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
                <p className="text-xs text-gray-500 mt-1">The total capacity of your battery storage in kilowatt-hours</p>
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
              <FaPlug className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-bold">Grid Connection</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Connect to Grid</label>
                  <p className="text-xs text-gray-500">Enable to connect your system to the power grid for energy trading</p>
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
                  <li><strong>Solar Capacity:</strong> {formData.solar_capacity} kW</li>
                  <li><strong>Panel Efficiency:</strong> {formData.panel_efficiency}</li>
                  <li><strong>Battery Capacity:</strong> {formData.battery_capacity} kWh</li>
                  <li><strong>Battery Efficiency:</strong> {formData.battery_efficiency}</li>
                  <li><strong>Grid Connection:</strong> {formData.grid_connection ? "Enabled" : "Disabled"}</li>
                  <li><strong>Location:</strong> {formData.latitude ? `${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}` : "Not set"}</li>
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
              <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
            <span className="ml-4 text-sm font-medium text-gray-700">Step {step} of 3</span>
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
              {step < 3 ? (
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