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
  FaHistory,
  FaWallet,
  FaStar,
} from "react-icons/fa"
import TradingService from "../services/trading"
import EnergyService from "../services/energy"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/Tabs"
import { Switch } from "../components/ui/switch"
import { Label } from "../components/ui/label"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { toast } from "react-hot-toast"

const Trading = () => {
  const [trades, setTrades] = useState([])
  const [userTrades, setUserTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [energyPrices, setEnergyPrices] = useState({
    grid_import: 0.22,
    grid_export: 0.1,
    p2p: 0.18,
  })
  const [availableEnergy, setAvailableEnergy] = useState(0)
  const [tradeHistory, setTradeHistory] = useState([])
  const [activeTab, setActiveTab] = useState("marketplace")
  const [accountBalance, setAccountBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [showNotification, setShowNotification] = useState(false)
  const [notification, setNotification] = useState({ title: "", message: "" })
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState(null)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [rating, setRating] = useState(0)
  const [autoPrice, setAutoPrice] = useState(true)

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
        setTrades(tradesResponse.data?.trades || [])
      } else {
        console.error("Failed to fetch trades:", tradesResponse.error)
      }

      // Fetch user's trades
      const userTradesResponse = await TradingService.getMyTrades()
      if (userTradesResponse.success) {
        setUserTrades(userTradesResponse.data?.trades || [])
      } else {
        console.error("Failed to fetch user trades:", userTradesResponse.error)
      }

      // Fetch energy prices
      const pricesResponse = await TradingService.getMarketPrice()
      if (pricesResponse.success) {
        setEnergyPrices({
          grid_import: pricesResponse.data?.grid_import || 0.22,
          grid_export: pricesResponse.data?.grid_export || 0.1,
          p2p: pricesResponse.data?.p2p || 0.18,
        })

        // Set default price for new trade
        setNewTrade((prev) => ({
          ...prev,
          price_per_kwh: pricesResponse.data?.p2p || 0.18,
        }))
      } else {
        console.error("Failed to fetch energy prices:", pricesResponse.error)
      }

      // Fetch available energy
      const energyResponse = await EnergyService.getEnergyOverview()
      if (energyResponse.success) {
        // Calculate available energy (generation - consumption)
        const generation = energyResponse.data?.today_generation || 0
        const consumption = energyResponse.data?.today_consumption || 0
        const balance = generation - consumption
        setAvailableEnergy(Math.max(0, balance))
      } else {
        console.error("Failed to fetch energy overview:", energyResponse.error)
      }

      // Fetch trade history
      const historyResponse = await TradingService.getTradeHistory()
      if (historyResponse.success) {
        setTradeHistory(historyResponse.data?.history || [])
      } else {
        console.error("Failed to fetch trade history:", historyResponse.error)
      }

      // Fetch account balance and transactions
      const accountResponse = await TradingService.getAccountInfo()
      if (accountResponse.success) {
        setAccountBalance(accountResponse.data?.balance || 0)
        setTransactions(accountResponse.data?.transactions || [])
      } else {
        console.error("Failed to fetch account info:", accountResponse.error)
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
        auto_price: autoPrice,
      })

      if (response.success) {
        setSuccess("Trade offer created successfully")
        setShowCreateForm(false)
        setNewTrade({
          amount: 1.0,
          price_per_kwh: energyPrices.p2p,
        })

        // Show notification
        toast.success("Trade offer created successfully")

        // Refresh trades
        fetchData()
      } else {
        setError(response.error || "Failed to create trade")
        toast.error(response.error || "Failed to create trade")
      }
    } catch (err) {
      console.error("Error creating trade:", err)
      setError("Failed to create trade. Please try again.")
      toast.error("Failed to create trade. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBuyTrade = (trade) => {
    setSelectedTrade(trade)
    setShowConfirmDialog(true)
  }

  const confirmBuyTrade = async () => {
    try {
      setLoading(true)
      setShowConfirmDialog(false)

      const response = await TradingService.buyTrade(selectedTrade.id)

      if (response.success) {
        setSuccess(
          `Successfully purchased ${selectedTrade.amount} kWh for $${(selectedTrade.amount * selectedTrade.price_per_kwh).toFixed(2)}`,
        )

        // Show notification
        toast.success(`Energy purchase successful!`)

        // Show notification dialog
        setNotification({
          title: "Energy Purchase Successful",
          message: `You have purchased ${selectedTrade.amount} kWh for $${(selectedTrade.amount * selectedTrade.price_per_kwh).toFixed(2)}. Your account has been debited and the energy has been added to your battery.`,
        })
        setShowNotification(true)

        // Refresh trades and account info
        fetchData()
      } else {
        setError(response.error || "Failed to buy trade")
        toast.error(response.error || "Failed to buy trade")
      }
    } catch (err) {
      console.error("Error buying trade:", err)
      setError("Failed to buy trade. Please try again.")
      toast.error("Failed to buy trade. Please try again.")
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
        toast.success("Trade cancelled successfully")

        // Refresh trades
        fetchData()
      } else {
        setError(response.error || "Failed to cancel trade")
        toast.error(response.error || "Failed to cancel trade")
      }
    } catch (err) {
      console.error("Error cancelling trade:", err)
      setError("Failed to cancel trade. Please try again.")
      toast.error("Failed to cancel trade. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRateTrade = (trade) => {
    setSelectedTrade(trade)
    setRating(0)
    setShowRatingDialog(true)
  }

  const submitRating = async () => {
    try {
      setLoading(true)
      setShowRatingDialog(false)

      const response = await TradingService.rateTrade(selectedTrade.id, rating)

      if (response.success) {
        setSuccess("Rating submitted successfully")
        toast.success("Rating submitted successfully")

        // Refresh trades
        fetchData()
      } else {
        setError(response.error || "Failed to submit rating")
        toast.error(response.error || "Failed to submit rating")
      }
    } catch (err) {
      console.error("Error submitting rating:", err)
      setError("Failed to submit rating. Please try again.")
      toast.error("Failed to submit rating. Please try again.")
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
          grid_import: 0.2 + Math.random() * 0.05,
          grid_export: 0.08 + Math.random() * 0.03,
        })
      }

      return data
    }

    // Process actual history data
    return tradeHistory.map((item) => ({
      date: new Date(item.date).toLocaleDateString(),
      p2p: item.avg_p2p_price,
      grid_import: item.grid_import_price,
      grid_export: item.grid_export_price,
    }))
  }

  // Prepare account balance history data
  const prepareBalanceHistoryData = () => {
    if (!transactions || transactions.length === 0) {
      return []
    }

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    // Calculate running balance
    let runningBalance = 0
    return sortedTransactions.map((transaction) => {
      if (transaction.type === "credit") {
        runningBalance += transaction.amount
      } else {
        runningBalance -= transaction.amount
      }

      return {
        date: new Date(transaction.timestamp).toLocaleDateString(),
        balance: runningBalance,
        amount: transaction.amount,
        type: transaction.type,
      }
    })
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <p className="text-xs text-gray-600">Grid import: ${energyPrices.grid_import.toFixed(2)}/kWh</p>
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

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-2 p-2 bg-yellow-100 rounded-full">
                <FaWallet className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Balance</p>
                <p className="text-2xl font-bold text-yellow-700">${accountBalance.toFixed(2)}</p>
                <p className="text-xs text-gray-600">
                  {transactions.length > 0
                    ? `Last transaction: ${new Date(transactions[0].timestamp).toLocaleDateString()}`
                    : "No transactions yet"}
                </p>
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Price per kWh ($)</label>
                  <div className="flex items-center">
                    <Switch checked={autoPrice} onCheckedChange={setAutoPrice} id="auto-price" />
                    <Label htmlFor="auto-price" className="ml-2 text-sm text-gray-600">
                      Auto price
                    </Label>
                  </div>
                </div>
                <input
                  type="number"
                  value={newTrade.price_per_kwh}
                  onChange={(e) => setNewTrade({ ...newTrade, price_per_kwh: Number(e.target.value) })}
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  disabled={autoPrice}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  {autoPrice
                    ? `Auto price will use the current market rate: $${energyPrices.p2p.toFixed(2)}/kWh`
                    : `Current market price: $${energyPrices.p2p.toFixed(2)}/kWh`}
                </p>
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
                      <p className="text-lg font-medium">
                        ${autoPrice ? energyPrices.p2p.toFixed(2) : newTrade.price_per_kwh.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Value</p>
                      <p className="text-lg font-medium">
                        ${(newTrade.amount * (autoPrice ? energyPrices.p2p : newTrade.price_per_kwh)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Compared to Grid</p>
                      <p
                        className={`text-lg font-medium ${(autoPrice ? energyPrices.p2p : newTrade.price_per_kwh) < energyPrices.grid_import ? "text-green-600" : "text-red-600"}`}
                      >
                        {(autoPrice ? energyPrices.p2p : newTrade.price_per_kwh) < energyPrices.grid_import
                          ? "Below"
                          : "Above"}{" "}
                        grid price
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="marketplace">
            <FaShoppingCart className="mr-2" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="myTrades">
            <FaExchangeAlt className="mr-2" />
            My Trades
          </TabsTrigger>
          <TabsTrigger value="accountHistory">
            <FaHistory className="mr-2" />
            Account History
          </TabsTrigger>
          <TabsTrigger value="priceHistory">
            <FaChartLine className="mr-2" />
            Price History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace">
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
                                <div className="text-sm font-medium text-gray-900">
                                  {trade.seller_name || "Unknown"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(trade.created_at).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{trade.amount.toFixed(1)} kWh</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${trade.price_per_kwh.toFixed(2)}/kWh</div>
                            <div className="text-xs text-gray-500">
                              {trade.price_per_kwh < energyPrices.grid_import ? (
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
                              onClick={() => handleBuyTrade(trade)}
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
        </TabsContent>

        <TabsContent value="myTrades">
          <Card>
            <CardHeader>
              <CardTitle>My Trade History</CardTitle>
              <CardDescription>Manage your active energy trade offers and view past trades</CardDescription>
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
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Order Type
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Order ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Counterparty
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
                            <div className="text-sm text-gray-900">
                              {new Date(trade.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(trade.created_at).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                trade.role === "seller" ? "bg-teal-100 text-teal-800" : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {trade.role === "seller" ? "Sell" : "Buy"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">#{trade.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {trade.role === "seller" ? trade.buyer_name || "Pending" : trade.seller_name || "Unknown"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{trade.amount.toFixed(1)} kWh</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${trade.price_per_kwh.toFixed(2)}/kWh</div>
                            <div className="text-sm text-gray-900">
                              ${(trade.amount * trade.price_per_kwh).toFixed(2)} total
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
                            {trade.status === "pending" && trade.role === "seller" && (
                              <Button
                                onClick={() => handleCancelTrade(trade.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={loading}
                              >
                                {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaTrash className="mr-2" />}
                                Cancel
                              </Button>
                            )}
                            {trade.status === "completed" && trade.role === "buyer" && !trade.rating && (
                              <Button
                                onClick={() => handleRateTrade(trade)}
                                className="bg-yellow-600 hover:bg-yellow-700"
                                disabled={loading}
                              >
                                <FaStar className="mr-2" />
                                Rate
                              </Button>
                            )}
                            {trade.status === "completed" && trade.rating && (
                              <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar key={i} className={i < trade.rating ? "text-yellow-500" : "text-gray-300"} />
                                ))}
                              </div>
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
        </TabsContent>

        <TabsContent value="accountHistory">
          <Card>
            <CardHeader>
              <CardTitle>Account History</CardTitle>
              <CardDescription>View your transaction history and account balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Balance History</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={prepareBalanceHistoryData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, ""]} />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#4FD1C5"
                        fill="#4FD1C5"
                        fillOpacity={0.6}
                        name="Account Balance"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">Transaction History</h3>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No transactions yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Your transaction history will appear here</p>
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
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Type
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
                          Reference
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(transaction.timestamp).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(transaction.timestamp).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{transaction.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                transaction.type === "credit"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {transaction.type === "credit" ? "Credit" : "Debit"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`text-sm font-medium ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                            >
                              {transaction.type === "credit" ? "+" : "-"}${transaction.amount.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {transaction.reference_id ? `#${transaction.reference_id}` : "N/A"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priceHistory">
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
                    <Line type="monotone" dataKey="grid_import" stroke="#FC8181" name="Grid Import Price" />
                    <Line type="monotone" dataKey="grid_export" stroke="#9F7AEA" name="Grid Export Price" />
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
                      <p className="text-sm text-gray-500">Grid Import Price</p>
                      <p className="text-xl font-medium text-red-600">${energyPrices.grid_import.toFixed(2)}/kWh</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Savings</p>
                      <p className="text-xl font-medium text-green-600">
                        {(((energyPrices.grid_import - energyPrices.p2p) / energyPrices.grid_import) * 100).toFixed(0)}%
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
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Energy Purchase</DialogTitle>
            <DialogDescription>Are you sure you want to purchase this energy?</DialogDescription>
          </DialogHeader>
          {selectedTrade && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-lg font-medium">{selectedTrade.amount.toFixed(1)} kWh</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price per kWh</p>
                  <p className="text-lg font-medium">${selectedTrade.price_per_kwh.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Cost</p>
                  <p className="text-lg font-medium">
                    ${(selectedTrade.amount * selectedTrade.price_per_kwh).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Seller</p>
                  <p className="text-lg font-medium">{selectedTrade.seller_name || "Unknown"}</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-800">
                  This amount will be deducted from your account balance and the energy will be added to your battery.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={confirmBuyTrade}>
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>How was your experience with this energy trade?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl focus:outline-none"
                >
                  <FaStar className={star <= rating ? "text-yellow-500" : "text-gray-300"} />
                </button>
              ))}
            </div>
            <p className="text-center mt-2 text-sm text-gray-500">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={submitRating} disabled={rating === 0}>
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={showNotification} onOpenChange={setShowNotification}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{notification.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">{notification.message}</p>
          </div>
          <DialogFooter>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowNotification(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Trading
