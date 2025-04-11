import api from "./api"

const WeatherService = {
  // Get current weather
  getCurrentWeather: async (latitude, longitude) => {
    try {
      const url = latitude && longitude ? `/weather/current?lat=${latitude}&lon=${longitude}` : "/weather/current"

      const response = await api.get(url)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching current weather:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch current weather",
        data: null,
      }
    }
  },

  // Get weather forecast
  getWeatherForecast: async (days = 7) => {
    try {
      const response = await api.get(`/weather/forecast?days=${days}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching weather forecast:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch weather forecast",
        data: { forecast: [] },
      }
    }
  },

  // Get solar forecast
  getSolarForecast: async (days = 3) => {
    try {
      const response = await api.get(`/weather/solar-forecast?days=${days}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching solar forecast:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch solar forecast",
        data: { forecast: [] },
      }
    }
  },

  // Get solar irradiance data
  getSolarIrradiance: async (date) => {
    try {
      const formattedDate = date ? new Date(date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
      const response = await api.get(`/weather/irradiance?date=${formattedDate}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching solar irradiance:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch solar irradiance data",
        data: null,
      }
    }
  },

  // Get historical weather data
  getHistoricalWeather: async (startDate, endDate) => {
    try {
      const formattedStartDate = new Date(startDate).toISOString().split("T")[0]
      const formattedEndDate = endDate
        ? new Date(endDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
      const response = await api.get(`/weather/historical?start=${formattedStartDate}&end=${formattedEndDate}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching historical weather:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch historical weather data",
        data: { historical: [] },
      }
    }
  },

  // Get temporary weather data (for configuration)
  getTempWeatherData: async (latitude, longitude) => {
    try {
      const response = await api.post("/weather/temp-data", { latitude, longitude })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching temporary weather data:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch temporary weather data",
        data: null,
      }
    }
  },
}

export default WeatherService
