"use client"

import { useState, useEffect } from "react"
import { FaSolarPanel, FaChartLine, FaCalendarAlt, FaSync, FaExclamationTriangle } from "react-icons/fa"
import EnergyService from "../services/EnergyService"
import EnergyChart from "../components/charts/EnergyChart"

const EnergyProduction = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [productionData, setProductionData] = useState({
    total_production: 0,
    current_production: 0,
    peak_production: 0,
    production_hours: 0,
    chart_data: {},
    forecast: {
      today: 0,
      tomorrow: 0,
      next_week: 0,
    },
    sources: [],
  })
  const [selectedPeriod, setSelectedPeriod] = useState("day")

  useEffect(() => {
    fetchProductionData()
  }, [selectedPeriod])

  const fetchProductionData = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await EnergyService.getEnergyProduction(selectedPeriod)
      setProductionData(data)
    } catch (err) {
      console.error("Error fetching production data:", err)
      setError("Failed to load energy production data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchProductionData()
  }

  if (loading && !productionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Energy Production</h1>

        <div className="flex flex-wrap items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <FaSync className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <FaSolarPanel className="text-yellow-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Production</p>
              <p className="text-2xl font-semibold">
                {productionData?.total_production ? productionData.total_production.toFixed(1) : "0.0"} kWh
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <FaChartLine className="text-green-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Production</p>
              <p className="text-2xl font-semibold">
                {productionData?.current_production ? productionData.current_production.toFixed(1) : "0.0"} kW
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <FaChartLine className="text-blue-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Peak Production</p>
              <p className="text-2xl font-semibold">
                {productionData?.peak_production ? productionData.peak_production.toFixed(1) : "0.0"} kW
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <FaCalendarAlt className="text-purple-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Production Hours</p>
              <p className="text-2xl font-semibold">{productionData?.production_hours || "0"} hrs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Production Chart */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Production Overview</h2>
        </div>
        <div className="p-4">
          <EnergyChart data={productionData?.chart_data || {}} period={selectedPeriod} type="production" />
        </div>
      </div>

      {/* Forecast Section */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Production Forecast</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-md font-medium text-gray-700 mb-2">Today</h3>
              <p className="text-2xl font-semibold text-teal-600">
                {productionData?.forecast?.today ? productionData.forecast.today.toFixed(1) : "0.0"} kWh
              </p>
              <p className="text-sm text-gray-500 mt-1">Expected total production</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-md font-medium text-gray-700 mb-2">Tomorrow</h3>
              <p className="text-2xl font-semibold text-teal-600">
                {productionData?.forecast?.tomorrow ? productionData.forecast.tomorrow.toFixed(1) : "0.0"} kWh
              </p>
              <p className="text-sm text-gray-500 mt-1">Forecasted production</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-md font-medium text-gray-700 mb-2">Next Week</h3>
              <p className="text-2xl font-semibold text-teal-600">
                {productionData?.forecast?.next_week ? productionData.forecast.next_week.toFixed(1) : "0.0"} kWh
              </p>
              <p className="text-sm text-gray-500 mt-1">Forecasted weekly production</p>
            </div>
          </div>
        </div>
      </div>

      {/* Production Sources */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Production Sources</h2>
        </div>
        <div className="p-4">
          {productionData?.sources && productionData.sources.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Source
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Capacity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Today's Production
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Efficiency
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productionData.sources.map((source, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-yellow-100">
                            <FaSolarPanel className="text-yellow-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{source.name}</div>
                            <div className="text-sm text-gray-500">{source.location || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{source.capacity} kW</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{source.production} kWh</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{source.efficiency}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-teal-600 h-2.5 rounded-full"
                            style={{ width: `${source.efficiency}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No production sources available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnergyProduction
