"use client"

import { useState, useEffect } from "react"
import { FaExchangeAlt, FaArrowUp, FaArrowDown } from "react-icons/fa"
import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

const TradeWidget = () => {
  const [tradeData, setTradeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTradeData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/trade/summary`)
        setTradeData(response.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching trade data:", err)
        setError("Failed to fetch trade data")

        // Use mock data as fallback
        setTradeData({
          current_price: 0.18,
          price_trend: "up",
          price_change: 5.2,
          available_energy: 4.5,
          market_value: 0.81,
          recent_trades: [
            { id: 1, type: "sell", amount: 2.5, price: 0.17, time: "2023-06-15T14:30:00Z" },
            { id: 2, type: "buy", amount: 1.0, price: 0.16, time: "2023-06-15T10:15:00Z" },
            { id: 3, type: "sell", amount: 3.2, price: 0.18, time: "2023-06-14T16:45:00Z" },
          ],
          market_demand: "high",
          forecast: {
            next_hour: 0.19,
            next_day: 0.17,
          },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTradeData()

    // Refresh trade data every 5 minutes
    const interval = setInterval(fetchTradeData, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

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

  if (error && !tradeData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-full">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Energy Market</h2>
      </div>

      {tradeData && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Current Price</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold">${tradeData.current_price.toFixed(2)}</p>
                <span className="ml-2 flex items-center text-sm">
                  {tradeData.price_trend === "up" ? (
                    <FaArrowUp className="text-green-500 mr-1" />
                  ) : (
                    <FaArrowDown className="text-red-500 mr-1" />
                  )}
                  <span className={tradeData.price_trend === "up" ? "text-green-500" : "text-red-500"}>
                    {tradeData.price_change}%
                  </span>
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Available Energy</p>
              <p className="text-2xl font-bold">{tradeData.available_energy.toFixed(1)} kWh</p>
              <p className="text-sm text-gray-500">Value: ${tradeData.market_value.toFixed(2)}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">Market Demand</p>
              <div
                className={`px-2 py-1 rounded text-xs font-medium ${
                  tradeData.market_demand === "high"
                    ? "bg-green-100 text-green-800"
                    : tradeData.market_demand === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {tradeData.market_demand.charAt(0).toUpperCase() + tradeData.market_demand.slice(1)}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Forecast (1h)</p>
                  <p className="font-medium">${tradeData.forecast.next_hour.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Forecast (24h)</p>
                  <p className="font-medium">${tradeData.forecast.next_day.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Recent Trades</p>
            <div className="space-y-2">
              {tradeData.recent_trades.map((trade) => (
                <div key={trade.id} className="bg-gray-50 p-3 rounded flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${trade.type === "sell" ? "bg-green-100" : "bg-blue-100"}`}>
                      <FaExchangeAlt className={`${trade.type === "sell" ? "text-green-600" : "text-blue-600"}`} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {trade.type === "sell" ? "Sold" : "Bought"} {trade.amount} kWh
                      </p>
                      <p className="text-xs text-gray-500">{new Date(trade.time).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="font-medium">${(trade.amount * trade.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TradeWidget
