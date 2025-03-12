"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card"
import { Button } from "../ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import api from "../../config/axios"
import { FaExclamationTriangle } from "react-icons/fa"

const MarketOverview = () => {
  const [marketData, setMarketData] = useState([])
  const [priceHistory, setPriceHistory] = useState([])
  const [timeRange, setTimeRange] = useState("day")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true)
        // Use the energy trading endpoints
        const [ordersResponse, priceResponse] = await Promise.all([
          api.get("/trade/active-trades"),
          api.get("/trade/market-prices"),
        ])

        // Transform trade data to match our needs
        const transformedOrders = ordersResponse.data.map((trade) => ({
          id: trade.id,
          type: trade.seller_id ? "Sell" : "Buy",
          amount: trade.amount,
          price: trade.price_per_kwh,
          expires: new Date(trade.created_at).toLocaleString(),
        }))

        setMarketData(transformedOrders)

        // Transform price history data
        if (priceResponse.data) {
          setPriceHistory(
            priceResponse.data.map((price) => ({
              timestamp: new Date(price.timestamp).toLocaleString(),
              price: price.price,
            })),
          )
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching market data:", err)
        setError(err.response?.data?.msg || "Failed to fetch market data")
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()
    // Refresh data every minute
    const interval = setInterval(fetchMarketData, 60000)
    return () => clearInterval(interval)
  }, [timeRange])

  const handleTimeRangeChange = (range) => {
    setTimeRange(range)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <div className="flex items-center text-red-600">
              <FaExclamationTriangle className="mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Price History</h3>
              <div className="flex space-x-2 mb-4">
                <Button
                  variant={timeRange === "day" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeRangeChange("day")}
                >
                  Day
                </Button>
                <Button
                  variant={timeRange === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeRangeChange("week")}
                >
                  Week
                </Button>
                <Button
                  variant={timeRange === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeRangeChange("month")}
                >
                  Month
                </Button>
              </div>

              <div className="h-64">
                {priceHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="price" stroke="#8884d8" name="Price ($/kWh)" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full bg-gray-50 rounded-md">
                    <p className="text-gray-500">No price history data available</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Active Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Amount (kWh)</th>
                      <th className="px-4 py-2 text-left">Price ($/kWh)</th>
                      <th className="px-4 py-2 text-left">Total ($)</th>
                      <th className="px-4 py-2 text-left">Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketData.length > 0 ? (
                      marketData.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${item.type === "Buy" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td className="px-4 py-2">{item.amount}</td>
                          <td className="px-4 py-2">${item.price.toFixed(2)}</td>
                          <td className="px-4 py-2">${(item.amount * item.price).toFixed(2)}</td>
                          <td className="px-4 py-2">{item.expires}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                          No active orders available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default MarketOverview

