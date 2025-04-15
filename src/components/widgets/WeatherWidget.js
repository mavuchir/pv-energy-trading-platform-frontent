"use client"

import { useState, useEffect } from "react"
import WeatherService from "../../services/WeatherService"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSun, faCloud, faCloudRain, faSnowflake, faBolt, faWind } from "@fortawesome/free-solid-svg-icons"

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState({
    temperature: 0,
    condition: "Unknown",
    humidity: 0,
    wind_speed: 0,
    forecast: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true)
        const data = await WeatherService.getCurrentWeather()
        setWeatherData(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch weather data:", err)
        setError("Failed to load weather data")
        // Set default data to prevent UI errors
        setWeatherData({
          temperature: 0,
          condition: "Unknown",
          humidity: 0,
          wind_speed: 0,
          forecast: [],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
    // Refresh weather data every 30 minutes
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case "sunny":
      case "clear":
        return <FontAwesomeIcon icon={faSun} className="text-yellow-400" />
      case "cloudy":
      case "partly cloudy":
        return <FontAwesomeIcon icon={faCloud} className="text-gray-400" />
      case "rainy":
      case "rain":
        return <FontAwesomeIcon icon={faCloudRain} className="text-blue-400" />
      case "snowy":
      case "snow":
        return <FontAwesomeIcon icon={faSnowflake} className="text-blue-200" />
      case "stormy":
      case "thunderstorm":
        return <FontAwesomeIcon icon={faBolt} className="text-yellow-500" />
      case "windy":
        return <FontAwesomeIcon icon={faWind} className="text-gray-500" />
      default:
        return <FontAwesomeIcon icon={faCloud} className="text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <p>Weather data unavailable</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Weather Conditions</h3>
      <div className="flex items-center justify-between mb-4">
        <div className="text-4xl">{getWeatherIcon(weatherData.condition)}</div>
        <div className="text-right">
          <div className="text-2xl font-bold">{weatherData.temperature}°C</div>
          <div className="text-gray-600">{weatherData.condition}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600">Humidity:</span> {weatherData.humidity}%
        </div>
        <div>
          <span className="text-gray-600">Wind:</span> {weatherData.wind_speed} km/h
        </div>
      </div>

      <h4 className="text-md font-semibold mt-4 mb-2">Forecast</h4>
      <div className="grid grid-cols-5 gap-1">
        {Array.isArray(weatherData.forecast) && weatherData.forecast.length > 0 ? (
          weatherData.forecast.slice(0, 5).map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs">{day.day}</div>
              <div className="my-1">{getWeatherIcon(day.condition)}</div>
              <div className="text-xs font-semibold">{day.temp}°C</div>
            </div>
          ))
        ) : (
          <div className="col-span-5 text-center text-gray-500">No forecast data available</div>
        )}
      </div>
    </div>
  )
}

export default WeatherWidget
