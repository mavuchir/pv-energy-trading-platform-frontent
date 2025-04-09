import api from "./api"

const WeatherService = {
  // Get current weather
  getCurrentWeather: async (latitude, longitude) => {
    try {
      const response = await api.get(`/weather/current?lat=${latitude}&lon=${longitude}`)
      return response.data
    } catch (error) {
      console.error("Error fetching current weather:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch current weather",
      }
    }
  },

  // Get weather forecast
  getWeatherForecast: async (latitude, longitude, days = 7) => {
    try {
      const response = await api.get(`/weather/forecast?lat=${latitude}&lon=${longitude}&days=${days}`)
      return response.data
    } catch (error) {
      console.error("Error fetching weather forecast:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch weather forecast",
      }
    }
  },

  // Get solar forecast
  getSolarForecast: async (days = 3) => {
    try {
      const response = await api.get(`/weather/solar-forecast?days=${days}`)
      return response.data
    } catch (error) {
      console.error("Error fetching solar forecast:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch solar forecast",
      }
    }
  },

  // Get solar irradiance data
  getSolarIrradiance: async (latitude, longitude, date) => {
    try {
      const formattedDate = date ? new Date(date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
      const response = await api.get(`/weather/irradiance?lat=${latitude}&lon=${longitude}&date=${formattedDate}`)
      return response.data
    } catch (error) {
      console.error("Error fetching solar irradiance:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch solar irradiance data",
      }
    }
  },

  // Get historical weather data
  getHistoricalWeather: async (latitude, longitude, startDate, endDate) => {
    try {
      const formattedStartDate = new Date(startDate).toISOString().split("T")[0]
      const formattedEndDate = new Date(endDate).toISOString().split("T")[0]
      const response = await api.get(
        `/weather/historical?lat=${latitude}&lon=${longitude}&start=${formattedStartDate}&end=${formattedEndDate}`,
      )
      return response.data
    } catch (error) {
      console.error("Error fetching historical weather:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch historical weather data",
      }
    }
  },
}

export default WeatherService

