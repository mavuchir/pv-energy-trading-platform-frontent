"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"
import {
  FaExclamationTriangle,
  FaCloud,
  FaSun,
  FaWind,
  FaCalendarAlt,
  FaSolarPanel,
  FaChartLine,
  FaTint,
  FaSync,
} from "react-icons/fa"
import WeatherService from "../services/weather"
import EnergyService from "../services/energy"

const Weather = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentWeather, setCurrentWeather] = useState(null)
  const [weatherForecast, setWeatherForecast] = useState([])
  const [solarForecast, setSolarForecast] = useState([])
  const [historicalWeather, setHistoricalWeather] = useState([])
  const [solarRadiationData, setSolarRadiationData] = useState([])
  const [selectedDays, setSelectedDays] = useState(3)
  const { user } = useAuth()

  const fetchWeatherData = async () => {
    try {
      setLoading(true)

      // Fetch current weather
      const currentResponse = await WeatherService.getCurrentWeather()
      if (currentResponse.success) {
        setCurrentWeather(currentResponse.data)
      }

      // Fetch weather forecast
      const forecastResponse = await WeatherService.getWeatherForecast(selectedDays)
      if (forecastResponse.success) {
        setWeatherForecast(forecastResponse.data.forecast || [])
      }

      // Fetch solar forecast
      const solarResponse = await WeatherService.getSolarForecast(selectedDays)
      if (solarResponse.success) {
        setSolarForecast(solarResponse.data.forecast || [])
      }

      // Fetch historical weather data
      const endDate = new Date().toISOString().split("T")[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] // 30 days ago
      const historicalResponse = await WeatherService.getHistoricalWeather(startDate, endDate)

      if (historicalResponse.success) {
        setHistoricalWeather(historicalResponse.data.historical || [])
      }

      // Get solar radiation data for the day
      const energyForecastResponse = await EnergyService.getEnergyForecast()
      if (energyForecastResponse.success) {
        setSolarRadiationData(energyForecastResponse.data.solar_radiation || [])
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching weather data:", err)
      setError(err.response?.data?.msg || "Failed to fetch weather data")
    } finally {
      setLoading(false)
    }
  }

  // Ensure data structures are properly initialized and check for arrays before using array methods
  useEffect(() => {
    fetchWeatherData()
  }, [selectedDays])

  // Format time for chart display
  const formatTime = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format date for chart display
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  // Format weather forecast data for chart
  const formatWeatherForecastData = () => {
    if (!Array.isArray(weatherForecast)) return []

    return weatherForecast.map((item) => ({
      time: new Date(item.timestamp).getHours() + ":00",
      date: formatDate(item.timestamp),
      temperature: item.temperature,
      cloudCover: item.cloud_cover,
      windSpeed: item.wind_speed,
      rainfall: item.precipitation,
    }))
  }

  // Format solar forecast data for chart
  const formatSolarForecastData = () => {
    if (!Array.isArray(solarForecast)) return []

    return solarForecast.map((item) => ({
      time: new Date(item.timestamp).getHours() + ":00",
      date: formatDate(item.timestamp),
      irradiance: item.solar_irradiance,
      estimatedGeneration: item.estimated_generation,
    }))
  }

  // Format historical data for chart
  const formatHistoricalData = () => {
    if (!Array.isArray(historicalWeather)) return []

    return historicalWeather.map((item) => ({
      date: formatDate(item.date),
      solarIrradiance: item.avg_solar_irradiance,
      generation: item.total_generation,
    }))
  }

  // Get weather icon based on weather condition
  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case "clear":
      case "sunny":
        return <FaSun className="text-yellow-500" />
      case "partly cloudy":
        return <FaCloud className="text-gray-400" />
      case "cloudy":
        return <FaCloud className="text-gray-500" />
      case "overcast":
        return <FaCloud className="text-gray-600" />
      case "rain":
      case "rainy":
      case "showers":
        return <FaTint className="text-blue-500" />
      default:
        return <FaSun className="text-yellow-500" />
    }
  }

  if (loading && !currentWeather) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-600">Weather Forecast</h1>
          <p className="text-gray-600">Weather data and solar generation predictions</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <div className="flex items-center bg-white border rounded-md p-1.5 shadow-sm">
            <FaCalendarAlt className="text-teal-600 mr-2 ml-1" />
            <select
              value={selectedDays}
              onChange={(e) => setSelectedDays(Number(e.target.value))}
              className="border-none focus:ring-0 text-sm font-medium"
            >
              <option value="1">1 Day</option>
              <option value="3">3 Days</option>
              <option value="7">7 Days</option>
            </select>
          </div>

          <Button onClick={fetchWeatherData} className="bg-teal-600 hover:bg-teal-700">
            <FaSync className={loading ? "mr-2 animate-spin" : "mr-2"} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-red-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <FaExclamationTriangle className="mr-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Weather Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Weather</CardTitle>
          <CardDescription>
            {currentWeather?.location || "Your location"} • Last updated:{" "}
            {currentWeather?.timestamp ? formatTime(currentWeather.timestamp) : "Unknown"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex flex-col items-center justify-center md:col-span-2">
              <div className="flex items-center">
                <div className="text-6xl mr-4">{getWeatherIcon(currentWeather?.condition)}</div>
                <div>
                  <p className="text-4xl font-bold">{currentWeather?.temperature?.toFixed(1) || "N/A"}°C</p>
                  <p className="text-lg text-gray-600 capitalize">{currentWeather?.condition || "Unknown"}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Feels like {currentWeather?.feels_like?.toFixed(1) || "N/A"}°C
              </p>
            </div>

            <div className="grid grid-cols-2 md:col-span-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center text-blue-600 mb-1">
                  <FaWind className="mr-2" />
                  <h3 className="font-medium">Wind</h3>
                </div>
                <p className="text-2xl font-bold">{currentWeather?.wind_speed?.toFixed(1) || "N/A"} m/s</p>
                <p className="text-xs text-gray-600">Direction: {currentWeather?.wind_direction || "N/A"}</p>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center text-yellow-600 mb-1">
                  <FaSun className="mr-2" />
                  <h3 className="font-medium">Solar</h3>
                </div>
                <p className="text-2xl font-bold">{currentWeather?.solar_irradiance?.toFixed(0) || "N/A"} W/m²</p>
                <p className="text-xs text-gray-600">UV Index: {currentWeather?.uv_index || "N/A"}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-gray-600 mb-1">
                  <FaCloud className="mr-2" />
                  <h3 className="font-medium">Clouds</h3>
                </div>
                <p className="text-2xl font-bold">{currentWeather?.cloud_cover || "N/A"}%</p>
                <p className="text-xs text-gray-600">
                  Visibility: {currentWeather?.visibility?.toFixed(1) || "N/A"} km
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center text-blue-600 mb-1">
                  <FaTint className="mr-2" />
                  <h3 className="font-medium">Humidity</h3>
                </div>
                <p className="text-2xl font-bold">{currentWeather?.humidity || "N/A"}%</p>
                <p className="text-xs text-gray-600">
                  Precipitation: {currentWeather?.precipitation?.toFixed(1) || "0"} mm
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different forecasts */}
      <Tabs defaultValue="weather" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="weather">Weather Forecast</TabsTrigger>
          <TabsTrigger value="solar">Solar Forecast</TabsTrigger>
          <TabsTrigger value="historical">Historical Data</TabsTrigger>
        </TabsList>

        {/* Weather Forecast Tab */}
        <TabsContent value="weather">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaCloud className="mr-2 text-teal-600" />
                Weather Forecast
              </CardTitle>
              <CardDescription>{selectedDays}-day weather forecast for your location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatWeatherForecastData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={selectedDays > 1 ? "date" : "time"} tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="temp" label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft" }} />
                    <YAxis
                      yAxisId="cloud"
                      orientation="right"
                      label={{ value: "Cloud Cover (%)", angle: 90, position: "insideRight" }}
                      domain={[0, 100]}
                    />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#F6AD55" name="Temperature" />
                    <Line yAxisId="cloud" type="monotone" dataKey="cloudCover" stroke="#A0AEC0" name="Cloud Cover" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-3">Hourly Forecast</h3>
                <div className="overflow-x-auto pb-2">
                  <div className="flex space-x-4 min-w-max">
                    {weatherForecast.slice(0, 24).map((hour, index) => (
                      <div key={index} className="flex flex-col items-center p-2 bg-gray-50 rounded-lg w-20">
                        <p className="text-xs text-gray-500">{new Date(hour.timestamp).getHours()}:00</p>
                        <div className="my-2 text-2xl">{getWeatherIcon(hour.condition)}</div>
                        <p className="text-sm font-bold">{hour.temperature.toFixed(1)}°C</p>
                        <p className="text-xs text-gray-500">{hour.cloud_cover}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Solar Forecast Tab */}
        <TabsContent value="solar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaSolarPanel className="mr-2 text-teal-600" />
                Solar Generation Forecast
              </CardTitle>
              <CardDescription>
                Predicted solar irradiance and energy generation for the next {selectedDays} day(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formatSolarForecastData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={selectedDays > 1 ? "date" : "time"} tick={{ fontSize: 12 }} />
                    <YAxis
                      yAxisId="irradiance"
                      label={{ value: "Solar Irradiance (W/m²)", angle: -90, position: "insideLeft" }}
                    />
                    <YAxis
                      yAxisId="generation"
                      orientation="right"
                      label={{ value: "Generation (kWh)", angle: 90, position: "insideRight" }}
                    />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="irradiance"
                      type="monotone"
                      dataKey="irradiance"
                      stroke="#F6AD55"
                      fill="#F6AD55"
                      fillOpacity={0.3}
                      name="Solar Irradiance"
                    />
                    <Area
                      yAxisId="generation"
                      type="monotone"
                      dataKey="estimatedGeneration"
                      stroke="#4FD1C5"
                      fill="#4FD1C5"
                      fillOpacity={0.3}
                      name="Estimated Generation"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-700 mb-2">Peak Solar Irradiance</h3>
                  <p className="text-2xl font-bold">
                    {solarForecast.length > 0
                      ? Math.max(...solarForecast.map((item) => item.solar_irradiance)).toFixed(0)
                      : "N/A"}{" "}
                    W/m²
                  </p>
                  <p className="text-sm text-gray-600">
                    Expected at{" "}
                    {solarForecast.length > 0
                      ? new Date(
                          solarForecast.reduce((max, item) =>
                            item.solar_irradiance > max.solar_irradiance ? item : max,
                          ).timestamp,
                        ).getHours() + ":00"
                      : "N/A"}
                  </p>
                </div>

                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-medium text-teal-700 mb-2">Total Energy Generation</h3>
                  <p className="text-2xl font-bold">
                    {solarForecast.reduce((sum, item) => sum + (item.estimated_generation || 0), 0).toFixed(1)} kWh
                  </p>
                  <p className="text-sm text-gray-600">Estimated for the next {selectedDays} day(s)</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-700 mb-2">Weather Impact</h3>
                  <p className="text-2xl font-bold">
                    {solarForecast.length > 0
                      ? (
                          100 -
                          solarForecast.reduce((sum, item) => sum + (item.cloud_cover || 0), 0) / solarForecast.length
                        ).toFixed(0)
                      : "N/A"}
                    %
                  </p>
                  <p className="text-sm text-gray-600">Solar efficiency due to weather conditions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historical Data Tab */}
        <TabsContent value="historical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaChartLine className="mr-2 text-teal-600" />
                Historical Performance
              </CardTitle>
              <CardDescription>Past 30 days of solar irradiance and energy generation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formatHistoricalData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
                    <YAxis
                      yAxisId="irradiance"
                      label={{ value: "Avg Solar Irradiance (W/m²)", angle: -90, position: "insideLeft" }}
                    />
                    <YAxis
                      yAxisId="generation"
                      orientation="right"
                      label={{ value: "Generation (kWh)", angle: 90, position: "insideRight" }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="irradiance" dataKey="solarIrradiance" fill="#F6AD55" name="Avg Solar Irradiance" />
                    <Bar yAxisId="generation" dataKey="generation" fill="#4FD1C5" name="Energy Generation" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Monthly Overview</h3>
                  <p className="text-2xl font-bold">
                    {historicalWeather.reduce((sum, item) => sum + (item.total_generation || 0), 0).toFixed(1)} kWh
                  </p>
                  <p className="text-sm text-gray-600">Total energy generation for the past 30 days</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Best Day</h3>
                  <p className="text-2xl font-bold">
                    {historicalWeather.length > 0
                      ? historicalWeather
                          .reduce((max, item) => (item.total_generation > max.total_generation ? item : max))
                          .total_generation.toFixed(1)
                      : "N/A"}{" "}
                    kWh
                  </p>
                  <p className="text-sm text-gray-600">
                    {historicalWeather.length > 0
                      ? formatDate(
                          historicalWeather.reduce((max, item) =>
                            item.total_generation > max.total_generation ? item : max,
                          ).date,
                        )
                      : "N/A"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Average Daily</h3>
                  <p className="text-2xl font-bold">
                    {historicalWeather.length > 0
                      ? (
                          historicalWeather.reduce((sum, item) => sum + (item.total_generation || 0), 0) /
                          historicalWeather.length
                        ).toFixed(1)
                      : "N/A"}{" "}
                    kWh
                  </p>
                  <p className="text-sm text-gray-600">Average daily energy generation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Daily Solar Radiation Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FaSun className="mr-2 text-yellow-500" />
            Today's Solar Radiation
          </CardTitle>
          <CardDescription>Solar irradiance throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={solarRadiationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                <YAxis label={{ value: "Solar Irradiance (W/m²)", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(value) => [`${value} W/m²`, "Solar Irradiance"]} />
                <Area
                  type="monotone"
                  dataKey="irradiance"
                  stroke="#ED8936"
                  fill="#F6AD55"
                  fillOpacity={0.6}
                  name="Solar Irradiance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Weather

