"use client"

import { createContext, useState, useContext, useEffect } from "react"
import EnergyService from "../services/energy"
import WeatherService from "../services/weather"
import { useAuth } from "./AuthContext"

// Create the context
const EnergyContext = createContext()

// Custom hook to use the energy context
export const useEnergy = () => useContext(EnergyContext)

// Provider component
export const EnergyProvider = ({ children }) => {
  const [energyData, setEnergyData] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshInterval, setRefreshInterval] = useState(60000) // 1 minute default

  const { user, isAuthenticated } = useAuth()

  // Fetch energy and weather data
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Only fetch if user is authenticated
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      // Fetch energy overview data
      const energyResponse = await EnergyService.getEnergyOverview()
      if (energyResponse.success) {
        setEnergyData(energyResponse.data)
      } else {
        console.error("Failed to fetch energy data:", energyResponse.error)
        setError("Failed to fetch energy data")
      }

      // Fetch weather data
      const weatherResponse = await WeatherService.getCurrentWeather()
      if (weatherResponse.success) {
        setWeatherData(weatherResponse.data)
      } else {
        console.error("Failed to fetch weather data:", weatherResponse.error)
      }

      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching energy data:", err)
      setError("Failed to fetch energy data")
    } finally {
      setLoading(false)
    }
  }

  // Fetch real-time data
  const fetchRealTimeData = async () => {
    try {
      // Only fetch if user is authenticated
      if (!isAuthenticated) return

      const response = await EnergyService.getRealTimeData()
      if (response.success) {
        // Update only real-time properties in energyData
        setEnergyData((prevData) => ({
          ...prevData,
          current_generation: response.data.current_generation,
          current_consumption: response.data.current_consumption,
          battery_status: response.data.battery_status,
          grid_status: response.data.grid_status,
          energy_balance: response.data.energy_balance,
        }))

        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error("Error fetching real-time data:", err)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  // Set up interval for real-time updates
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      fetchRealTimeData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [isAuthenticated, refreshInterval])

  // Refresh data manually
  const refreshData = () => {
    fetchData()
  }

  // Change refresh interval
  const setRefreshRate = (milliseconds) => {
    setRefreshInterval(milliseconds)
  }

  // Record energy data (for simulation)
  const recordEnergyData = async (data) => {
    try {
      const response = await EnergyService.recordEnergyData(data)
      if (response.success) {
        // Refresh data after recording
        fetchData()
        return { success: true }
      } else {
        return { success: false, error: response.error }
      }
    } catch (err) {
      console.error("Error recording energy data:", err)
      return { success: false, error: "Failed to record energy data" }
    }
  }

  // Context value
  const value = {
    energyData,
    weatherData,
    loading,
    error,
    lastUpdated,
    refreshInterval,
    refreshData,
    setRefreshRate,
    recordEnergyData,
    fetchRealTimeData,
  }

  return <EnergyContext.Provider value={value}>{children}</EnergyContext.Provider>
}
