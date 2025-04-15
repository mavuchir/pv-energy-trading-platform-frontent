import api from "./api"

class WeatherService {
  // Get current weather
  static async getCurrentWeather() {
    try {
      const response = await api.get("/weather/current")
      return response.data
    } catch (error) {
      console.error("Get current weather error:", error)
      // Return fallback data to prevent UI errors
      return {
        temperature: 0,
        condition: "Unknown",
        humidity: 0,
        wind_speed: 0,
        forecast: [],
      }
    }
  }

  // Get weather forecast
  static async getWeatherForecast(days = 7) {
    try {
      const response = await api.get(`/weather/forecast?days=${days}`)
      return response.data
    } catch (error) {
      console.error("Get weather forecast error:", error)
      // Return fallback data to prevent UI errors
      return {
        forecast: [],
      }
    }
  }

  // Get historical weather data
  static async getHistoricalWeather(startDate, endDate) {
    try {
      const response = await api.get(`/weather/historical?start_date=${startDate}&end_date=${endDate}`)
      return response.data
    } catch (error) {
      console.error("Get historical weather error:", error)
      return { data: [] }
    }
  }

  // Get solar irradiance data
  static async getSolarIrradiance(period = "day") {
    try {
      const response = await api.get(`/weather/irradiance?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Get solar irradiance error:", error)
      return { data: [] }
    }
  }

  // Get weather alerts
  static async getWeatherAlerts() {
    try {
      const response = await api.get("/weather/alerts")
      return response.data
    } catch (error) {
      console.error("Get weather alerts error:", error)
      return { alerts: [] }
    }
  }
}

export default WeatherService
