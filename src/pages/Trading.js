"use client"

import { useState, useEffect } from "react"
import {
  FaExchangeAlt,
  FaPlus,
  FaSync,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaMoneyBillWave,
  FaBolt,
} from "react-icons/fa"
import { useAuth } from "../contexts/AuthContext"
import axios from "axios" // Import axios

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

const Trading = () => {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [communities, setCommunities] = useState([])
  const [selectedCommunity, setSelectedCommunity] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [marketPrices, setMarketPrices] = useState(null)
  const [tradeStats, setTradeStats] = useState({
    total_sold: 0,
    total_bought: 0,
    pending_trades: 0,
    average_price: 0,
  })
  const [formData, setFormData] = useState({
    amount: "",
    price: "",
    community_id: "",
    description: "",
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchTrades()
    fetchCommunities()
    fetchMarketPrices()
    fetchTradeStats()
  }, [])

  const fetchTrades = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_URL}/trade/list`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          community_id: selectedCommunity || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      })

      setTrades(response.data.trades || [])
    } catch (err) {
      console.error("Error fetching trades:", err)
      setError("Failed to fetch trades. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunities = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_URL}/community`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { member_only: true },
      })

      setCommunities(response.data.communities || [])

      // Set default community if available
      if (response.data.communities && response.data.communities.length > 0) {
        setFormData((prev) => ({
          ...prev,
          community_id: response.data.communities[0].id,
        }))
      }
    } catch (err) {
      console.error("Error fetching communities:", err)
    }
  }

  const fetchMarketPrices = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_URL}/trade/market-prices`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setMarketPrices(response.data)
    } catch (err) {
      console.error("Error fetching market prices:", err)
    }
  }

  const fetchTradeStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_URL}/trade/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setTradeStats(response.data)
    } catch (err) {
      console.error("Error fetching trade stats:", err)
    }
  }

  const handleCreateTrade = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem("token")
      const response = await axios.post(`${API_URL}/trade/create`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Update trades list
      setTrades([response.data.trade, ...trades])

      setSuccess("Trade created successfully")
      setTimeout(() => setSuccess(null), 3000)

      // Reset form and close modal
      setFormData({
        amount: "",
        price: "",
        community_id: communities.length > 0 ? communities[0].id : "",
        description: "",
      })
      setShowCreateModal(false)

      // Refresh stats
      fetchTradeStats()
    } catch (err) {
      console.error("Error creating trade:", err)
      setError("Failed to create trade. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelTrade = async (tradeId) => {
    if (!window.confirm("Are you sure you want to cancel this trade?")) return

    try {
      setLoading(true)

      const token = localStorage.getItem("token")
      await axios.post(
        `${API_URL}/trade/${tradeId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Update trades list
      setTrades(trades.map((trade) => (trade.id === tradeId ? { ...trade, status: "cancelled" } : trade)))

      setSuccess("Trade cancelled successfully")
      setTimeout(() => setSuccess(null), 3000)

      // Refresh stats
      fetchTradeStats()
    } catch (err) {
      console.error("Error cancelling trade:", err)
      setError("Failed to cancel trade. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptTrade = async (tradeId) => {
    try {
      setLoading(true)

      const token = localStorage.getItem("token")
      await axios.post(
        `${API_URL}/trade/${tradeId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Update trades list
      setTrades(trades.map((trade) => (trade.id === tradeId ? { ...trade, status: "completed" } : trade)))

      setSuccess("Trade accepted successfully")
      setTimeout(() => setSuccess(null), 3000)

      // Refresh stats
      fetchTradeStats()
    } catch (err) {
      console.error("Error accepting trade:", err)
      setError("Failed to accept trade. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchTrades()
    fetchTradeStats()
    fetchMarketPrices()
  }

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch =
      trade.seller?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.buyer?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trade.description && trade.description.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || trade.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading && trades.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-teal-600">Energy Trading</h1>
            <p className="text-gray-600">Buy and sell energy within your community</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={() => fetchTrades()}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FaSync className={loading ? "mr-2 animate-spin" : "mr-2"} />
              Refresh
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700"
            >
              <FaPlus className="mr-2" />
              Create Trade
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-red-600">
              <FaExclamationTriangle className="mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-green-600">
              <FaCheckCircle className="mr-2" />
              <p>{success}</p>
            </div>
          </div>
        )}

        {/* Trading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-teal-50 to-green-50 border border-teal-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-teal-100 rounded-full">
                <FaBolt className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Energy Sold</p>
                <p className="text-2xl font-bold text-teal-700">{tradeStats.total_sold.toFixed(2)} kWh</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-blue-100 rounded-full">
                <FaBolt className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Energy Bought</p>
                <p className="text-2xl font-bold text-blue-700">{tradeStats.total_bought.toFixed(2)} kWh</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-yellow-100 rounded-full">
                <FaExchangeAlt className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Trades</p>
                <p className="text-2xl font-bold text-yellow-700">{tradeStats.pending_trades}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-purple-100 rounded-full">
                <FaMoneyBillWave className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Price</p>
                <p className="text-2xl font-bold text-purple-700">${tradeStats.average_price.toFixed(4)}/kWh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Market Prices */}
        {marketPrices && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Current Market Prices</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Current Price</p>
                  <p className="text-2xl font-semibold text-teal-600">${marketPrices.current_price.toFixed(4)}/kWh</p>
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(marketPrices.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">24h Low</p>
                  <p className="text-2xl font-semibold text-blue-600">${marketPrices.low_24h.toFixed(4)}/kWh</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">24h High</p>
                  <p className="text-2xl font-semibold text-red-600">${marketPrices.high_24h.toFixed(4)}/kWh</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trade List */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Available Trades</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrades.length > 0 ? (
                  filteredTrades.map((trade) => (
                    <tr key={trade.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(trade.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{trade.seller?.username || "Unknown"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {trade.buyer?.username || (trade.status === "pending" ? "Available" : "Unknown")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.amount} kWh</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${trade.price}/kWh</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${trade.total_price}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            trade.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : trade.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {trade.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {trade.status === "pending" && (
                            <>
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
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Accept
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No trades found. Create your first trade to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Trade Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Create New Trade</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (kWh)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="e.g., 5.0"
                    step="0.1"
                    min="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($/kWh)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="e.g., 0.15"
                    step="0.0001"
                    min="0.0001"
                  />
                  {marketPrices && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current market price: ${marketPrices.current_price.toFixed(4)}/kWh
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Community</label>
                  <select
                    value={formData.community_id}
                    onChange={(e) => setFormData({ ...formData, community_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    {communities.map((community) => (
                      <option key={community.id} value={community.id}>
                        {community.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Add any additional details about this trade"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTrade}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                disabled={loading || !formData.amount || !formData.price || !formData.community_id}
              >
                {loading ? "Creating..." : "Create Trade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Trading
