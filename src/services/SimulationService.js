import api from "./api"

const simulationService = {
  // Get current simulation settings
  getSimulationSettings: async () => {
    try {
      const response = await api.get("/simulation/settings")
      return { success: true, settings: response.data.settings }
    } catch (error) {
      console.error("Error fetching simulation settings:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch simulation settings",
      }
    }
  },

  // Update simulation settings
  updateSimulationSettings: async (settings) => {
    try {
      const response = await api.put("/simulation/settings", settings)
      return { success: true, settings: response.data.settings }
    } catch (error) {
      console.error("Error updating simulation settings:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to update simulation settings",
      }
    }
  },

  // Enable simulation
  enableSimulation: async () => {
    try {
      const response = await api.post("/simulation/enable", {})
      return { success: true, message: response.data.msg }
    } catch (error) {
      console.error("Error enabling simulation:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to enable simulation",
      }
    }
  },

  // Disable simulation
  disableSimulation: async () => {
    try {
      const response = await api.post("/simulation/disable", {})
      return { success: true, message: response.data.msg }
    } catch (error) {
      console.error("Error disabling simulation:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to disable simulation",
      }
    }
  },

  // Run a single simulation step
  runSimulationStep: async () => {
    try {
      const response = await api.post("/simulation/step", {})
      return { success: true, results: response.data.results }
    } catch (error) {
      console.error("Error running simulation step:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to run simulation step",
      }
    }
  },

  // Run a simulation for a period
  runSimulationPeriod: async (hours = 24) => {
    try {
      const response = await api.post("/simulation/run", { hours })
      return { success: true, results: response.data.results }
    } catch (error) {
      console.error("Error running simulation period:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to run simulation period",
      }
    }
  },

  // Reset simulation data
  resetSimulation: async () => {
    try {
      const response = await api.post("/simulation/reset", {})
      return { success: true, message: response.data.msg }
    } catch (error) {
      console.error("Error resetting simulation:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to reset simulation",
      }
    }
  },

  // Get simulation scenarios
  getSimulationScenarios: async () => {
    try {
      const response = await api.get("/simulation/scenarios")
      return { success: true, scenarios: response.data.scenarios || [] }
    } catch (error) {
      console.error("Error fetching simulation scenarios:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch simulation scenarios",
      }
    }
  },

  // Apply a simulation scenario
  applySimulationScenario: async (scenarioId) => {
    try {
      const response = await api.post(`/simulation/scenarios/${scenarioId}/apply`, {})
      return { success: true, settings: response.data.settings }
    } catch (error) {
      console.error(`Error applying simulation scenario ${scenarioId}:`, error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to apply simulation scenario",
      }
    }
  },
}

export default simulationService
