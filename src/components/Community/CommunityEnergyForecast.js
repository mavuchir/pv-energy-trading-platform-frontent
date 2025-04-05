"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/Card"
import { Tabs, TabsList, TabsTrigger } from "../ui/Tabs"
import { FaSun, FaCloud, FaBolt, FaChartLine, FaCalendarDay, FaCalendarWeek } from "react-icons/fa"

const CommunityEnergyForecast = ({ forecast, communityId }) => {
  const [timeframe, setTimeframe] = useState("daily")

  // Helper function to get the appropriate forecast data based on timeframe
  const getForecastData = () => {
    if (!forecast) return []

    return timeframe === "daily" ? forecast.daily : forecast.weekly
  }

  // Helper function to get the appropriate label for the time period
  const getTimeLabel = (index) => {
    if (timeframe === "daily") {
      const hours = ["12am", "3am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"]
      return hours[index % hours.length]
    } else {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      return days[index % days.length]
    }
  }

  // Helper function to get weather icon based on condition
  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case "sunny":
      case "clear":
        return <FaSun className="text-yellow-500" />
      case "cloudy":
      case "partly cloudy":
        return <FaCloud className="text-gray-500" />
      default:
        return <FaCloud className="text-gray-400" />
    }
  }

  const forecastData = getForecastData()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <FaChartLine className="mr-2 text-teal-600" />
          Community Energy Forecast
        </h3>
        <Tabs value={timeframe} onValueChange={setTimeframe} className="w-auto">
          <TabsList>
            <TabsTrigger value="daily" className="flex items-center">
              <FaCalendarDay className="mr-2" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center">
              <FaCalendarWeek className="mr-2" />
              Weekly
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {!forecastData || forecastData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FaChartLine className="text-gray-400 text-4xl mb-3" />
            <p className="text-gray-500">No forecast data available</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Chart visualization */}
                <div className="h-64 relative mb-4">
                  <div className="absolute inset-0 flex items-end">
                    {forecastData.map((item, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div
                          className="w-full bg-teal-500 rounded-t-sm"
                          style={{
                            height: `${(item.generation / (forecastData.reduce((max, i) => Math.max(max, i.generation), 0) || 1)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    ))}
                  </div>

                  {/* Horizontal grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="border-t border-gray-200 w-full h-0"></div>
                    ))}
                  </div>
                </div>

                {/* Data points */}
                <div className="grid grid-cols-8 gap-2">
                  {forecastData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="text-xs text-gray-500">{getTimeLabel(index)}</div>
                      <div className="flex items-center mt-1">
                        {getWeatherIcon(item.weather)}
                        <span className="ml-1 text-xs">{item.generation.toFixed(1)} kW</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center text-teal-600 mb-1">
                  <FaSun className="mr-2" />
                  <h4 className="font-medium">Peak Generation</h4>
                </div>
                <p className="text-xl font-bold">
                  {Math.max(...forecastData.map((item) => item.generation)).toFixed(1)} kW
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center text-teal-600 mb-1">
                  <FaBolt className="mr-2" />
                  <h4 className="font-medium">Total Energy</h4>
                </div>
                <p className="text-xl font-bold">
                  {forecastData.reduce((sum, item) => sum + item.generation, 0).toFixed(1)} kWh
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center text-teal-600 mb-1">
                  <FaCloud className="mr-2" />
                  <h4 className="font-medium">Weather Impact</h4>
                </div>
                <p className="text-xl font-bold">{forecast.weather_impact || "Medium"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CommunityEnergyForecast

