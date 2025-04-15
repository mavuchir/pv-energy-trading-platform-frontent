"use client"

import { useState, useEffect } from "react"
import { FaBatteryFull, FaBatteryThreeQuarters, FaBatteryHalf, FaBatteryQuarter, FaBatteryEmpty } from "react-icons/fa"
import api from "../../services/api" // Assuming your axios instance is in "@/api/index.js" or a similar path

const BatteryWidget = () => {
  const [batteryData, setBatteryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBatteryData = async () => {
      try {
        setLoading(true)
        const response = await api.get("/energy/battery") // Use the api instance
        setBatteryData(response.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching battery data:", err)
        setError("Failed to fetch battery data")

        // Optionally, remove the mock data fallback if you want to strictly rely on the API
        // setBatteryData({
        //   level: 75,
        //   capacity: 10,
        //   power: 2.5,
        //   charging: true,
        //   estimated_duration: 4.5,
        //   health: 95,
        //   cycles: 120,
        //   temperature: 28,
        // })
      } finally {
        setLoading(false)
      }
    }

    fetchBatteryData()

    // Refresh battery data every minute
    const interval = setInterval(fetchBatteryData, 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const getBatteryIcon = (level) => {
    if (level > 87.5) return <FaBatteryFull className="text-green-500" />
    if (level > 62.5) return <FaBatteryThreeQuarters className="text-green-500" />
    if (level > 37.5) return <FaBatteryHalf className="text-yellow-500" />
    if (level > 12.5) return <FaBatteryQuarter className="text-orange-500" />
    return <FaBatteryEmpty className="text-red-500" />
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-full flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-full">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Battery Status</h2>
      </div>

      {batteryData && (
        <div className="p-4">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <svg className="w-32 h-32" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={batteryData.level > 70 ? "#48BB78" : batteryData.level > 30 ? "#ECC94B" : "#F56565"}
                  strokeWidth="3"
                  strokeDasharray={`${batteryData.level}, 100`}
                  className="transform -rotate-90 origin-center"
                />
                <text x="18" y="20.35" className="text-3xl" textAnchor="middle" fill="#2D3748">
                  {batteryData.level}%
                </text>
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium flex items-center">
                {getBatteryIcon(batteryData.level)}
                <span className="ml-2">{batteryData.charging ? "Charging" : "Discharging"}</span>
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Power</p>
              <p className="font-medium">
                {batteryData.power} kW
                <span className="text-xs text-gray-500 ml-1">{batteryData.charging ? "in" : "out"}</span>
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Capacity</p>
              <p className="font-medium">{batteryData.capacity} kWh</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">{batteryData.charging ? "Time to Full" : "Time Remaining"}</p>
              <p className="font-medium">{batteryData.estimated_duration} hrs</p>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded mb-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Battery Health</p>
              <p className="text-sm font-medium text-green-600">{batteryData.health}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${batteryData.health}%` }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Cycles</p>
              <p className="font-medium">{batteryData.cycles}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Temperature</p>
              <p className="font-medium">{batteryData.temperature}°C</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BatteryWidget