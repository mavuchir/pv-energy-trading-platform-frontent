"use client"

import { createContext, useState, useContext, useCallback } from "react"
import axios from "axios"

// Create the simulation context
export const SimulationContext = createContext()

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

export const SimulationProvider = ({ children }) => {
  const [isSimulationRunning, setIsSimulationRunning] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [simulationTime, setSimulationTime] = useState(new Date())
  const [simulationWeather, setSimulationWeather] = useState({
    temperature: 25,
    cloudCover: 30,
    windSpeed: 5,
    precipitation: 0,
    condition: "sunny",
  })
  const [simulationError, setSimulationError] = useState(null)
  const [simulationSuccess, setSimulationSuccess] = useState(null)

  // Clear messages
  const clearMessages = useCallback(() => {
    setSimulationError(null)
    setSimulationSuccess(null)
  }, [])

  // Start simulation
  const startSimulation = async (params = {}) => {
    clearMessages()
    try {
      setIsSimulationRunning(true)

      // Set default parameters if not provided
      const simulationParams = {
        speed: params.speed || simulationSpeed,
        weather: params.weather || simulationWeather,
        start_time: params.startTime || new Date().toISOString(),
        ...params,
      }

      const response = await axios.post(`${API_URL}/simulation/start`, simulationParams)

      setSimulationSuccess("Simulation started successfully")
      return response.data
    } catch (err) {
      console.error("Simulation start error:", err)
      setSimulationError(err.response?.data?.msg || "Failed to start simulation")
      setIsSimulationRunning(false)
      throw err
    }
  }

  // Stop simulation
  const stopSimulation = async () => {
    clearMessages()
    try {
      const response = await axios.post(`${API_URL}/simulation/stop`)
      setIsSimulationRunning(false)
      setSimulationSuccess("Simulation stopped successfully")
      return response.data
    } catch (err) {
      console.error("Simulation stop error:", err)
      setSimulationError(err.response?.data?.msg || "Failed to stop simulation")
      throw err
    }
  }

  // Update simulation parameters
  const updateSimulation = async (params) => {
    clearMessages()
    try {
      const response = await axios.put(`${API_URL}/simulation/update`, params)

      if (params.speed) {
        setSimulationSpeed(params.speed)
      }

      if (params.weather) {
        setSimulationWeather((prev) => ({ ...prev, ...params.weather }))
      }

      setSimulationSuccess("Simulation updated successfully")
      return response.data
    } catch (err) {
      console.error("Simulation update error:", err)
      setSimulationError(err.response?.data?.msg || "Failed to update simulation")
      throw err
    }
  }

  // Get simulation status
  const getSimulationStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/simulation/status`)
      setIsSimulationRunning(response.data.is_running)
      setSimulationSpeed(response.data.speed)
      setSimulationTime(new Date(response.data.current_time))
      setSimulationWeather(response.data.weather)
      return response.data
    } catch (err) {
      console.error("Get simulation status error:", err)
      throw err
    }
  }

  return (
    <SimulationContext.Provider
      value={{
        isSimulationRunning,
        simulationSpeed,
        simulationTime,
        simulationWeather,
        simulationError,
        simulationSuccess,
        startSimulation,
        stopSimulation,
        updateSimulation,
        getSimulationStatus,
        clearMessages,
      }}
    >
      {children}
    </SimulationContext.Provider>
  )
}

// Custom hook to use the simulation context
export const useSimulation = () => {
  const context = useContext(SimulationContext)
  if (context === undefined) {
    throw new Error("useSimulation must be used within a SimulationProvider")
  }
  return context
}
