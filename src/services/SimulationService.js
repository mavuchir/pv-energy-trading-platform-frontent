import axios from "axios"

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

class SimulationService {
  // Get simulation status
  static async getSimulationStatus() {
    try {
      const response = await axios.get(`${API_URL}/simulation/status`)
      return response.data
    } catch (error) {
      console.error("Get simulation status error:", error)
      throw error
    }
  }

  // Start simulation
  static async startSimulation(params = {}) {
    try {
      const response = await axios.post(`${API_URL}/simulation/start`, params)
      return response.data
    } catch (error) {
      console.error("Start simulation error:", error)
      throw error
    }
  }

  // Stop simulation
  static async stopSimulation() {
    try {
      const response = await axios.post(`${API_URL}/simulation/stop`)
      return response.data
    } catch (error) {
      console.error("Stop simulation error:", error)
      throw error
    }
  }

  // Update simulation parameters
  static async updateSimulation(params) {
    try {
      const response = await axios.put(`${API_URL}/simulation/update`, params)
      return response.data
    } catch (error) {
      console.error("Update simulation error:", error)
      throw error
    }
  }

  // Run simulation for a specific duration
  static async runSimulation(duration, speed = 10) {
    try {
      const response = await axios.post(`${API_URL}/simulation/run`, {
        duration,
        speed,
      })
      return response.data
    } catch (error) {
      console.error("Run simulation error:", error)
      throw error
    }
  }

  // Get simulation scenarios
  static async getSimulationScenarios() {
    try {
      const response = await axios.get(`${API_URL}/simulation/scenarios`)
      return response.data
    } catch (error) {
      console.error("Get simulation scenarios error:", error)
      throw error
    }
  }

  // Load simulation scenario
  static async loadSimulationScenario(scenarioId) {
    try {
      const response = await axios.post(`${API_URL}/simulation/scenarios/${scenarioId}/load`)
      return response.data
    } catch (error) {
      console.error("Load simulation scenario error:", error)
      throw error
    }
  }

  // Save current simulation as scenario
  static async saveSimulationScenario(name, description) {
    try {
      const response = await axios.post(`${API_URL}/simulation/scenarios/save`, {
        name,
        description,
      })
      return response.data
    } catch (error) {
      console.error("Save simulation scenario error:", error)
      throw error
    }
  }
}

export default SimulationService
