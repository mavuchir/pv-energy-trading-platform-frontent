"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaExchangeAlt,
  FaShoppingCart,
  FaPlus,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaSpinner,
  FaTrash,
  FaChartLine,
  FaMoneyBillWave,
  FaUserFriends,
  FaHome,
} from "react-icons/fa"
import TradingService from "../services/trading"
import EnergyService from "../services/energy"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts"

const Trading = () => {
  const [trades, setTrades] = useState([])
  const [userTrades, setUserTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [energyPrices, setEnergyPrices] = useState({
    grid: 0.22,
    p2p: 0.18,
  })
  const [availableEnergy, setAvailableEnergy] = useState(0)
  const [tradeHistory, setTradeHistory] = useState([])
  const [activeTab, setActiveTab] = useState("marketplace")

  const [newTrade, setNewTrade] = useState({
    amount: 1.0,
    price_per_kwh: 0.18,
  })

  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch trades and energy data
  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch all trades
      const tradesResponse = await TradingService.getAvailableTrades()
      if (tradesResponse.success) {
        setTrades(tradesResponse.data.trades || [])
      } else {
        console.error("Failed to fetch trades:", tradesResponse.error)
      }

      // Fetch user's trades
      const userTradesResponse = await TradingService.getMyTrades()
      if (userTradesResponse.success) {
        setUserTrades(userTradesResponse.data.trades || [])
      } else {
        console.error("Failed to fetch user trades:", userTradesResponse.error)
      }

      // Fetch energy prices
      const pricesResponse = await TradingService.getEnergyPrices()
      if (pricesResponse.success) {
        setEnergyPrices(
          pricesResponse.data.prices || {
            grid: 0.22,
            p2p: 0.18,
          },
        )

        // Set default price for new trade
        setNewTrade((prev) => ({
          ...prev,
          price_per_kwh: pricesResponse.data.prices?.p2p || 0.18,
        }))
      } else {
        console.error("Failed to fetch energy prices:", pricesResponse.error)
      }

      // Fetch available energy
      const energyResponse = await EnergyService.getEnergyOverview()
      if (energyResponse.success) {
        // Calculate available energy (generation - consumption)
        const generation = energyResponse.data.today_generation || 0
        const consumption = energyResponse.data.today_consumption || 0
        const balance = generation - consumption
        setAvailableEnergy(Math.max(0, balance))
      } else {
        console.error("Failed to fetch energy overview:", energyResponse.error)
      }

      // Fetch trade history
      const historyResponse = await TradingService.getTradeHistory()
      if (historyResponse.success) {
        setTradeHistory(historyResponse.data.history || [])
      } else {
        console.error("Failed to fetch trade history:", historyResponse.error)
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to fetch trading data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleCreateTrade = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      if (newTrade.amount <= 0) {
        setError("Please enter a valid energy amount")
        setLoading(false)
        return
      }

      if (newTrade.amount > availableEnergy) {
        setError("You don't have enough energy to sell")
        setLoading(false)
        return
      }

      const response = await TradingService.createSellOrder({
        amount: newTrade.amount,
        price_per_kwh: newTrade.price_per_kwh,
      })

      if (response.success) {
        setSuccess("Trade offer created successfully")
        setShowCreateForm(false)
        setNewTrade({
          amount: 1.0,
          price_per_kwh: energyPrices.p2p,
        })

        // Refresh trades
        fetchData()
      } else {
        setError(response.error || "Failed to create trade")
      }
    } catch (err) {
      console.error("Error creating trade:", err)
      setError("Failed to create trade. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBuyTrade = async (tradeId, amount, price) => {
    try {
      setLoading(true)

      const response = await TradingService.buyTrade(tradeId)

      if (response.success) {
        setSuccess(`Successfully purchased ${amount} kWh for $${(amount * price).toFixed(2)}`)

        // Refresh trades
        fetchData()
      } else {
        setError(response.error || "Failed to buy trade")
      }
    } catch (err) {
      console.error("Error buying trade:", err)
      setError("Failed to buy trade. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelTrade = async (tradeId) => {
    try {
      setLoading(true)

      const response = await TradingService.cancelTrade(tradeId)

      if (response.success) {
        setSuccess("Trade cancelled successfully")

        // Refresh trades
        fetchData()
      } else {
        setError(response.error || "Failed to cancel trade")
      }
    } catch (err) {
      console.error("Error cancelling trade:", err)
      setError("Failed to cancel trade. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Prepare price history data for chart
  const preparePriceHistoryData = () => {
    // Generate some sample data if no history
    if (!tradeHistory || tradeHistory.length === 0) {
      const data = []
      const now = new Date()

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)

        data.push({
          date: date.toLocaleDateString(),
          p2p: 0.15 + Math.random() * 0.1,
          grid: 0.2 + Math.random() * 0.05,
        })
      }

      return data
    }

    // Process actual history data
    return tradeHistory.map((item) => ({
      date: new Date(item.date).toLocaleDateString(),
      p2p: item.avg_p2p_price,
      grid: item.grid_price,
    }))
  }

  if (loading && trades.length === 0 && userTrades.length === 0) {
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
          <h1 className="text-3xl font-bold text-teal-600">Energy Trading</h1>
          <p className="text-gray-600">Buy and sell energy within your community</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button onClick={() => navigate("/dashboard")} className="bg-gray-200 hover:bg-gray-300 text-gray-800">
            <FaHome className="mr-2" /> Back to Dashboard
          </Button>

          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-teal-600 hover:bg-teal-700"
            disabled={availableEnergy <= 0}
          >
            {showCreateForm ? (
              "Cancel"
            ) : (
              <>
                <FaPlus className="mr-2" /> Sell Energy
              </>
            )}
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

      {success && (
        <Card className="bg-green-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center text-green-600">
              <FaCheckCircle className="mr-2" />
              <p>{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Energy Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-teal-100 rounded-full">
                <FaExchangeAlt className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Energy</p>
                <p className="text-2xl font-bold text-teal-700">{availableEnergy.toFixed(1)} kWh</p>
                <p className="text-xs text-gray-600">
                  Market value: ${(availableEnergy * energyPrices.p2p).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-blue-100 rounded-full">
                <FaMoneyBillWave className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current P2P Price</p>
                <p className="text-2xl font-bold text-blue-700">${energyPrices.p2p.toFixed(2)}/kWh</p>
                <p className="text-xs text-gray-600">Grid price: ${energyPrices.grid.toFixed(2)}/kWh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-purple-100 rounded-full">
                <FaUserFriends className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Trades</p>
                <p className="text-2xl font-bold text-purple-700">{trades.length}</p>
                <p className="text-xs text-gray-600">Your trades: {userTrades.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sell Energy Form */}
      {showCreateForm && (
        <Card className="mb-6 bg-teal-50 border-teal-100">
          <CardHeader>
            <CardTitle>Sell Your Energy</CardTitle>
            <CardDescription>Create a new trade offer to sell your excess energy</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTrade} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Sell (kWh)</label>
                <input
                  type="number"
                  value={newTrade.amount}
                  onChange={(e) => setNewTrade({ ...newTrade, amount: Number(e.target.value) })}
                  min="0.1"
                  max={availableEnergy}
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  You have {availableEnergy.toFixed(1)} kWh available to sell
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per kWh ($)</label>
                <input
                  type="number"
                  value={newTrade.price_per_kwh}
                  onChange={(e) => setNewTrade({ ...newTrade, price_per_kwh: Number(e.target.value) })}
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">Current market price: ${energyPrices.p2p.toFixed(2)}/kWh</p>
              </div>

              <div className="md:col-span-2">
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Trade Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Amount to Sell</p>
                      <p className="text-lg font-medium">{newTrade.amount.toFixed(1)} kWh</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price per kWh</p>
                      <p className="text-lg font-medium">${newTrade.price_per_kwh.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Value</p>
                      <p className="text-lg font-medium">${(newTrade.amount * newTrade.price_per_kwh).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Compared to Grid</p>
                      <p
                        className={`text-lg font-medium ${newTrade.price_per_kwh < energyPrices.grid ? "text-green-600" : "text-red-600"}`}
                      >
                        {newTrade.price_per_kwh < energyPrices.grid ? "Below" : "Above"} grid price
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={loading || newTrade.amount <= 0 || newTrade.amount > availableEnergy}
                >
                  {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaExchangeAlt className="mr-2" />}
                  Create Trade Offer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "marketplace"
              ? "text-teal-600 border-b-2 border-teal-600"
              : "text-gray-500 hover:text-teal-600"
          }`}
          onClick={() => setActiveTab("marketplace")}
        >
          <FaShoppingCart className="inline mr-2" />
          Marketplace
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "myTrades" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-500 hover:text-teal-600"
          }`}
          onClick={() => setActiveTab("myTrades")}
        >
          <FaExchangeAlt className="inline mr-2" />
          My Trades
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "priceHistory"
              ? "text-teal-600 border-b-2 border-teal-600"
              : "text-gray-500 hover:text-teal-600"
          }`}
          onClick={() => setActiveTab("priceHistory")}
        >
          <FaChartLine className="inline mr-2" />
          Price History
        </button>
      </div>

      {activeTab === "marketplace" && (
        <Card>
          <CardHeader>
            <CardTitle>Available Energy Trades</CardTitle>
            <CardDescription>Browse and purchase energy from other users</CardDescription>
          </CardHeader>
          <CardContent>
            {trades.length === 0 ? (
              <div className="text-center py-8">
                <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No trades available</h3>
                <p className="mt-1 text-sm text-gray-500">Be the first to offer energy for sale!</p>
                <div className="mt-6">
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-teal-600 hover:bg-teal-700"
                    disabled={availableEnergy <= 0}
                  >
                    <FaPlus className="mr-2" /> Sell Energy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Seller
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total Value
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trades.map((trade) => (
                      <tr key={trade.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-teal-100 rounded-full">
                              {trade.seller_name?.charAt(0) || "U"}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{trade.seller_name || "Unknown"}</div>
                              <div className="text-xs text-gray-500">{new Date(trade.created_at).toLocaleString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{trade.amount.toFixed(1)} kWh</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${trade.price_per_kwh.toFixed(2)}/kWh</div>
                          <div className="text-xs text-gray-500">
                            {trade.price_per_kwh < energyPrices.grid ? (
                              <span className="text-green-600">Below grid price</span>
                            ) : (
                              <span className="text-red-600">Above grid price</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${(trade.amount * trade.price_per_kwh).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            onClick={() => handleBuyTrade(trade.id, trade.amount, trade.price_per_kwh)}
                            className="bg-teal-600 hover:bg-teal-700"
                            disabled={loading || trade.seller_id === user?.id}
                          >
                            {loading ? (
                              <FaSpinner className="animate-spin mr-2" />
                            ) : (
                              <FaShoppingCart className="mr-2" />
                            )}
                            Buy
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "myTrades" && (
        <Card>
          <CardHeader>
            <CardTitle>My Trade Offers</CardTitle>
            <CardDescription>Manage your active energy trade offers</CardDescription>
          </CardHeader>
          <CardContent>
            {userTrades.length === 0 ? (
              <div className="text-center py-8">
                <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No active trades</h3>
                <p className="mt-1 text-sm text-gray-500">You don't have any active trade offers</p>
                <div className="mt-6">
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-teal-600 hover:bg-teal-700"
                    disabled={availableEnergy <= 0}
                  >
                    <FaPlus className="mr-2" /> Create Trade Offer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Created
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total Value
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userTrades.map((trade) => (
                      <tr key={trade.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(trade.created_at).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{new Date(trade.created_at).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{trade.amount.toFixed(1)} kWh</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${trade.price_per_kwh.toFixed(2)}/kWh</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${(trade.amount * trade.price_per_kwh).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              trade.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : trade.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {trade.status === "pending" && (
                            <Button
                              onClick={() => handleCancelTrade(trade.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={loading}
                            >
                              {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaTrash className="mr-2" />}
                              Cancel
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "priceHistory" && (
        <Card>
          <CardHeader>
            <CardTitle>Energy Price History</CardTitle>
            <CardDescription>Track energy price trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={preparePriceHistoryData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, "auto"]} />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, ""]} />
                  <Legend />
                  <Line type="monotone" dataKey="p2p" stroke="#4FD1C5" name="P2P Price" />
                  <Line type="monotone" dataKey="grid" stroke="#FC8181" name="Grid Price" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Price Comparison</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Current P2P Price</p>
                    <p className="text-xl font-medium text-teal-600">${energyPrices.p2p.toFixed(2)}/kWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Grid Price</p>
                    <p className="text-xl font-medium text-red-600">${energyPrices.grid.toFixed(2)}/kWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Savings</p>
                    <p className="text-xl font-medium text-green-600">
                      {(((energyPrices.grid - energyPrices.p2p) / energyPrices.grid) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Trading Tips</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <FaArrowUp className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Sell when prices are high (peak demand hours)</span>
                  </li>
                  <li className="flex items-start">
                    <FaArrowDown className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Buy when prices are low (off-peak hours)</span>
                  </li>
                  <li className="flex items-start">
                    <FaExchangeAlt className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Trading below grid price benefits both buyers and sellers</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Trading

