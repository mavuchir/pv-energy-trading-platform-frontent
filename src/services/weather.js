import api from "./api"

const WeatherService = {
  // Get current weather
  getCurrentWeather: async () => {
    try {
      const response = await api.get("/weather/current")
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching current weather:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch current weather" }
    }
  },

  // Get weather forecast
  getWeatherForecast: async (days = 3) => {
    try {
      const response = await api.get(`/weather/forecast?days=${days}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching weather forecast:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch weather forecast" }
    }
  },

  // Get solar forecast
  getSolarForecast: async (days = 3) => {
    try {
      const response = await api.get(`/weather/solar-forecast?days=${days}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching solar forecast:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch solar forecast" }
    }
  },

  // Get historical weather data
  getHistoricalWeather: async (startDate, endDate) => {
    try {
      const response = await api.get(`/weather/historical?start_date=${startDate}&end_date=${endDate}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error fetching historical weather:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to fetch historical weather" }
    }
  },
}

export default WeatherService

