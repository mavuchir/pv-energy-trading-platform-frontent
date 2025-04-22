"use client"

import { useState, useEffect } from "react"
import {
  FaExchangeAlt,
  FaShoppingCart,
  FaStore,
  FaSync,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaPlus,
} from "react-icons/fa"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import tradingService from "../../services/TradeService"
import energyService from "../../services/EnergyService"
import socketService from "../../services/socketService"
import { useAuth } from "../../contexts/AuthContext"

const TradingPlatform = () => {
  const [activeTrades, setActiveTrades] = useState([])
  const [tradeHistory, setTradeHistory] = useState([])
  const [marketPrice, setMarketPrice] = useState(0)
  const [priceHistory, setPriceHistory] = useState([])
  const [energyBalance, setEnergyBalance] = useState({
    available: 0,
    forecasted: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [activeTab, setActiveTab] = useState("buy") // 'buy', 'sell', 'active', 'history'
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)
  const [tradeData, setTradeData] = useState({
    type: "sell",
    amount: "",
    price: "",
    total: 0,
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchAllData()

    // Connect to WebSocket for real-time updates
    socketService.connect()

    const tradeUpdatedUnsubscribe = socketService.subscribe("trade_updated", (data) => {
      console.log("Real-time trade update:", data)
      fetchTrades()
    })

    const priceUpdatedUnsubscribe = socketService.subscribe("price_updated", (data) => {
      console.log("Real-time price update:", data)
      setMarketPrice(data.price)
    })

    const energyUpdatedUnsubscribe = socketService.subscribe("energy_balance_updated", (data) => {
      console.log("Real-time energy balance update:", data)
      setEnergyBalance(data.balance)
    })

    return () => {
      tradeUpdatedUnsubscribe()
      priceUpdatedUnsubscribe()
      energyUpdatedUnsubscribe()
      socketService.disconnect()
    }
  }, [])

  // Calculate total price whenever amount or price changes
  useEffect(() => {
    if (tradeData.amount && tradeData.price) {
      const total = Number.parseFloat(tradeData.amount) * Number.parseFloat(tradeData.price)
      setTradeData((prev) => ({
        ...prev,
        total: total.toFixed(2),
      }))
    } else {
      setTradeData((prev) => ({
        ...prev,
        total: 0,
      }))
    }
  }, [tradeData.amount, tradeData.price])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.allSettled([fetchTrades(), fetchMarketPrice(), fetchEnergyBalance()])
    } catch (err) {
      setError("Failed to load trading data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchTrades = async () => {
    try {
      // Fetch active trades
      const activeResponse = await tradingService.getTrades("pending")
      if (activeResponse.success) {
        setActiveTrades(activeResponse.trades)
      } else {
        console.error("Failed to fetch active trades:", activeResponse.error)
      }

      // Fetch trade history
      const historyResponse = await tradingService.getTrades("completed")
      if (historyResponse.success) {
        setTradeHistory(historyResponse.trades)
      } else {
        console.error("Failed to fetch trade history:", historyResponse.error)
      }
    } catch (err) {
      console.error("Error fetching trades:", err)
      setError("Failed to fetch trades")
    }
  }

  const fetchMarketPrice = async () => {
    try {
      // Get current market price
      const priceResponse = await tradingService.getMarketPrice()
      if (priceResponse.success) {
        setMarketPrice(priceResponse.price)

        // Update default price in trade form
        setTradeData((prev) => ({
          ...prev,
          price: priceResponse.price.toFixed(3),
        }))
      } else {
        console.error("Failed to fetch market price:", priceResponse.error)
      }

      // Get price history
      const historyResponse = await tradingService.getMarketPriceHistory(7)
      if (historyResponse.success) {
        setPriceHistory(historyResponse.prices)
      } else {
        console.error("Failed to fetch price history:", historyResponse.error)
      }
    } catch (err) {
      console.error("Error fetching market price:", err)
      setError("Failed to fetch market price")
    }
  }

  const fetchEnergyBalance = async () => {
    try {
      const response = await energyService.getDashboardData()
      if (response.success) {
        const data = response.data

        // Calculate available energy (today's production - consumption)
        const available = (data.today?.production || 0) - (data.today?.consumption || 0)

        // Get forecasted energy (from forecasts)
        let forecasted = 0
        if (data.forecast?.production && data.forecast?.consumption) {
          const totalProduction = data.forecast.production.reduce((sum, item) => sum + item.amount, 0)
          const totalConsumption = data.forecast.consumption.reduce((sum, item) => sum + item.amount, 0)
          forecasted = totalProduction - totalConsumption
        }

        setEnergyBalance({
          available: available > 0 ? available : 0,
          forecasted: forecasted > 0 ? forecasted : 0,
        })
      } else {
        console.error("Failed to fetch energy balance:", response.error)
      }
    } catch (err) {
      console.error("Error fetching energy balance:", err)
      setError("Failed to fetch energy balance")
    }
  }

  const handleCreateTrade = async () => {
    try {
      const payload = {
        type: tradeData.type,
        amount: Number.parseFloat(tradeData.amount),
        price: Number.parseFloat(tradeData.price),
      }

      const response = await tradingService.createTrade(payload)
      if (response.success) {
        setSuccess(`${tradeData.type === "sell" ? "Sell" : "Buy"} order created successfully`)
        setIsTradeModalOpen(false)
        fetchTrades()

        // Reset form
        setTradeData({
          type: "sell",
          amount: "",
          price: marketPrice.toFixed(3),
          total: 0,
        })

        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response.error || "Failed to create trade")
      }
    } catch (err) {
      console.error("Error creating trade:", err)
      setError("An error occurred while creating the trade")
    }
  }

  const handleCancelTrade = async (tradeId) => {
    try {
      const response = await tradingService.cancelTrade(tradeId)
      if (response.success) {
        setSuccess("Trade cancelled successfully")

        // Update local state
        setActiveTrades((prev) => prev.filter((trade) => trade.id !== tradeId))

        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response.error || "Failed to cancel trade")
      }
    } catch (err) {
      console.error("Error cancelling trade:", err)
      setError("An error occurred while cancelling the trade")
    }
  }

  const handleAcceptTrade = async (tradeId) => {
    try {
      const response = await tradingService.acceptTrade(tradeId)
      if (response.success) {
        setSuccess("Trade accepted successfully")

        // Update local state
        const trade = activeTrades.find((t) => t.id === tradeId)
        if (trade) {
          setActiveTrades((prev) => prev.filter((t) => t.id !== tradeId))
          setTradeHistory((prev) => [{ ...trade, status: "completed" }, ...prev])
        }

        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(response.error || "Failed to accept trade")
      }
    } catch (err) {
      console.error("Error accepting trade:", err)
      setError("An error occurred while accepting the trade")
    }
  }

  const openTradeModal = (type) => {
    setTradeData({
      type,
      amount: "",
      price: marketPrice.toFixed(3),
      total: 0,
    })
    setIsTradeModalOpen(true)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Prepare price history data for chart
  const preparePriceHistoryData = () => {
    return priceHistory.map((item) => ({
      time: new Date(item.timestamp).toLocaleDateString(),
      price: item.price,
    }))
  }

  const priceHistoryData = preparePriceHistoryData()

  if (loading && activeTrades.length === 0 && tradeHistory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-600">Energy Trading</h1>
          <p className="text-gray-600">Buy and sell energy in the marketplace</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchAllData}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md flex items-center"
          >
            <FaSync className={loading ? "mr-2 animate-spin" : "mr-2"} />
            Refresh
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 p-4 rounded-md border border-green-200 mb-6">
          <div className="flex items-center text-green-600">
            <FaCheckCircle className="mr-2" />
            <p>{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6">
          <div className="flex items-center text-red-600">
            <FaExclamationTriangle className="mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Market Price Card */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-2">
            <FaStore className="text-teal-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Market Price</h2>
          </div>
          <p className="text-3xl font-bold text-teal-700">${marketPrice.toFixed(3)}/kWh</p>

          {priceHistoryData.length > 0 && (
            <div className="h-[150px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`$${value}/kWh`, "Price"]} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#0D9488"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Energy Balance Card */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-2">
            <FaExchangeAlt className="text-teal-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Your Energy Balance</h2>
          </div>
          <div className="mb-2">
            <p className="text-sm text-gray-600">Available for Trading</p>
            <p className="text-2xl font-bold text-teal-700">{energyBalance.available.toFixed(2)} kWh</p>
            <p className="text-xs text-gray-500">Value: ${(energyBalance.available * marketPrice).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Forecasted Surplus (Next 24h)</p>
            <p className="text-lg font-semibold text-teal-600">{energyBalance.forecasted.toFixed(2)} kWh</p>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-4">
            <FaShoppingCart className="text-teal-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => openTradeModal("sell")}
              className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-md flex items-center justify-center"
              disabled={energyBalance.available <= 0}
            >
              <FaPlus className="mr-2" />
              Sell Energy
            </button>
            <button
              onClick={() => openTradeModal("buy")}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center"
            >
              <FaPlus className="mr-2" />
              Buy Energy
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab("buy")}
            className={`px-4 py-2 font-medium ${
              activeTab === "buy" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-500 hover:text-teal-600"
            }`}
          >
            Buy Orders
          </button>
          <button
            onClick={() => setActiveTab("sell")}
            className={`px-4 py-2 font-medium ${
              activeTab === "sell" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-500 hover:text-teal-600"
            }`}
          >
            Sell Orders
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 font-medium ${
              activeTab === "active" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-500 hover:text-teal-600"
            }`}
          >
            Your Active Orders
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-medium ${
              activeTab === "history" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-500 hover:text-teal-600"
            }`}
          >
            Trade History
          </button>
        </div>
      </div>

      {/* Buy Orders Tab */}
      {activeTab === "buy" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Buy Orders</h2>
            <p className="text-sm text-gray-600">Users looking to buy energy</p>
          </div>

          {activeTrades.filter((trade) => trade.type === "buy").length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeTrades
                    .filter((trade) => trade.type === "buy")
                    .map((trade) => (
                      <tr key={trade.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{trade.buyer.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{trade.amount.toFixed(2)} kWh</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${trade.price.toFixed(3)}/kWh</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${(trade.amount * trade.price).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(trade.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {trade.seller_id === user?.id ? (
                            <button
                              onClick={() => handleCancelTrade(trade.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAcceptTrade(trade.id)}
                              className="text-teal-600 hover:text-teal-900"
                            >
                              Sell
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <FaInfoCircle className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-gray-500">No buy orders available at the moment</p>
            </div>
          )}
        </div>
      )}

      {/* Sell Orders Tab */}
      {activeTab === "sell" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Sell Orders</h2>
            <p className="text-sm text-gray-600">Users looking to sell energy</p>
          </div>

          {activeTrades.filter((trade) => trade.type === "sell").length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeTrades
                    .filter((trade) => trade.type === "sell")
                    .map((trade) => (
                      <tr key={trade.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{trade.seller.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{trade.amount.toFixed(2)} kWh</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${trade.price.toFixed(3)}/kWh</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${(trade.amount * trade.price).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(trade.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {trade.buyer_id === user?.id ? (
                            <button
                              onClick={() => handleCancelTrade(trade.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAcceptTrade(trade.id)}
                              className="text-teal-600 hover:text-teal-900"
                            >
                              Buy
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <FaInfoCircle className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-gray-500">No sell orders available at the moment</p>
            </div>
          )}
        </div>
      )}

      {/* Your Active Orders Tab */}
      {activeTab === "active" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Your Active Orders</h2>
            <p className="text-sm text-gray-600">Orders you've placed that are still active</p>
          </div>

          {activeTrades.filter((trade) => trade.seller_id === user?.id || trade.buyer_id === user?.id).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeTrades
                    .filter((trade) => trade.seller_id === user?.id || trade.buyer_id === user?.id)
                    .map((trade) => (
                      <tr key={trade.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              trade.type === "sell" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {trade.type === "sell" ? "Selling" : "Buying"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{trade.amount.toFixed(2)} kWh</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${trade.price.toFixed(3)}/kWh</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${(trade.amount * trade.price).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(trade.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleCancelTrade(trade.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <FaInfoCircle className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-gray-500">You don't have any active orders</p>
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={() => openTradeModal("sell")}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md"
                >
                  Create Sell Order
                </button>
                <button
                  onClick={() => openTradeModal("buy")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Create Buy Order
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trade History Tab */}
      {activeTab === "history" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Trade History</h2>
            <p className="text-sm text-gray-600">Your completed transactions</p>
          </div>

          {tradeHistory.filter((trade) => trade.seller_id === user?.id || trade.buyer_id === user?.id).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      With
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tradeHistory
                    .filter((trade) => trade.seller_id === user?.id || trade.buyer_id === user?.id)
                    .map((trade) => {
                      const isSeller = trade.seller_id === user?.id
                      const counterparty = isSeller ? trade.buyer.username : trade.seller.username

                      return (
                        <tr key={trade.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                isSeller ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {isSeller ? "Sold" : "Bought"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{counterparty}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{trade.amount.toFixed(2)} kWh</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${trade.price.toFixed(3)}/kWh</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${(trade.amount * trade.price).toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(trade.completed_at || trade.updated_at)}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <FaInfoCircle className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-gray-500">You don't have any completed trades yet</p>
            </div>
          )}
        </div>
      )}

      {/* Create Trade Modal */}
      {isTradeModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {tradeData.type === "sell" ? "Sell Energy" : "Buy Energy"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (kWh)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={tradeData.amount}
                  onChange={(e) => setTradeData({ ...tradeData, amount: e.target.value })}
                  placeholder="e.g. 5.0"
                />
                {tradeData.type === "sell" && energyBalance.available > 0 && (
                  <p className="text-xs text-gray-600 mt-1">Available: {energyBalance.available.toFixed(2)} kWh</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per kWh ($)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={tradeData.price}
                  onChange={(e) => setTradeData({ ...tradeData, price: e.target.value })}
                  placeholder="e.g. 0.150"
                />
                <p className="text-xs text-gray-600 mt-1">Current market price: ${marketPrice.toFixed(3)}/kWh</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Amount:</span>
                  <span className="font-semibold">${tradeData.total}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsTradeModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTrade}
                className={`px-4 py-2 rounded-md text-white ${
                  !tradeData.amount || !tradeData.price
                    ? "bg-gray-400 cursor-not-allowed"
                    : tradeData.type === "sell"
                      ? "bg-teal-600 hover:bg-teal-700"
                      : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={!tradeData.amount || !tradeData.price}
              >
                {tradeData.type === "sell" ? "Create Sell Order" : "Create Buy Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TradingPlatform
