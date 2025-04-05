"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/Input"
import { Switch } from "../components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import {
  FaExclamationTriangle,
  FaShoppingCart,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaChartLine,
  FaUsers,
  FaHistory,
  FaSync,
  FaChartBar,
} from "react-icons/fa"
import TradingService from "../services/trading"
import EnergyService from "../services/energy"
import CommunityService from "../services/community"
import { useNavigate } from "react-router-dom"

const Trading = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("market")
  const [marketData, setMarketData] = useState(null)
  const [communityTrades, setCommunityTrades] = useState([])
  const [tradingHistory, setTradingHistory] = useState([])
  const [priceData, setPriceData] = useState([])
  const [availableEnergy, setAvailableEnergy] = useState(0)
  const [currentPrice, setCurrentPrice] = useState(0.2)
  const [priceChange, setPriceChange] = useState("+$0.02")
  const [buyAmount, setBuyAmount] = useState(1.5)
  const [sellAmount, setSellAmount] = useState(0)
  const [communities, setCommunities] = useState([])
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [autoSellEnabled, setAutoSellEnabled] = useState(false)
  const [autoBuyEnabled, setAutoBuyEnabled] = useState(false)
  const [pricingStrategy, setPricingStrategy] = useState("fixed")
  const [minimumSellPrice, setMinimumSellPrice] = useState("0.18")
  const [isPreferencesDialogOpen, setIsPreferencesDialogOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch all necessary data
  const fetchTradingData = async () => {
    try {
      setLoading(true)

      // Fetch market data
      const marketResponse = await TradingService.getMarketData()
      if (marketResponse.success) {
        setMarketData(marketResponse.data)
      }

      // Fetch energy overview to get available energy
      const energyResponse = await EnergyService.getEnergyOverview()
      if (energyResponse.success) {
        // Calculate available energy
        if (energyResponse.data.energy_balance) {
          const availableEnergyValue = Math.max(0, energyResponse.data.energy_balance).toFixed(1)
          setAvailableEnergy(availableEnergyValue)
          setSellAmount(availableEnergyValue)
        }

        // Set current price
        if (energyResponse.data.energy_prices?.p2p) {
          setCurrentPrice(energyResponse.data.energy_prices.p2p)
          // Calculate price change
          const previousPrice = 0.18 // Base reference price
          const change = energyResponse.data.energy_prices.p2p - previousPrice
          setPriceChange((change >= 0 ? "+" : "") + "$" + Math.abs(change).toFixed(2))
        }
      }

      // Fetch price forecast
      const priceResponse = await TradingService.getPriceForecast()
      if (priceResponse.success) {
        setPriceData(priceResponse.data.forecast || [])
      }

      // Fetch trading history
      const historyResponse = await TradingService.getTradingHistory()
      if (historyResponse.success) {
        setTradingHistory(historyResponse.data.trades || [])
      }

      // Fetch communities
      const communitiesResponse = await CommunityService.listCommunities()
      if (communitiesResponse.success) {
        setCommunities(communitiesResponse.communities || [])

        // Set default community if available
        if (communitiesResponse.communities && communitiesResponse.communities.length > 0) {
          setSelectedCommunity(communitiesResponse.communities[0])

          // Fetch community trades
          const communityTradesResponse = await TradingService.getMarketData(communitiesResponse.communities[0].id)
          if (communityTradesResponse.success) {
            setCommunityTrades(communityTradesResponse.data.active_trades || [])
          }
        }
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching trading data:", err)
      setError(err.response?.data?.msg || "Failed to fetch trading data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTradingData()
  }, [])

  // Update the CommunityTrading component to ensure communityTrades is an array
  useEffect(() => {
    fetchCommunityData()
  }, [])

  const fetchCommunityData = async () => {
    try {
      setLoading(true)
      // Get list of communities (should only be one default community)
      const communitiesResponse = await CommunityService.listCommunities()
      const communities = communitiesResponse.communities || []

      if (communities.length > 0) {
        // Get the default community (first one)
        const defaultCommunity = communities[0]
        setSelectedCommunity(defaultCommunity)

        // Fetch community trades
        await fetchCommunityTrades(defaultCommunity.id)
      } else {
        setError("No community found. Please contact support.")
      }
    } catch (err) {
      console.error("Error fetching community data:", err)
      setError(err.response?.data?.msg || "Failed to fetch community data")
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunityTrades = async (communityId) => {
    try {
      const response = await TradingService.getMarketData(communityId)
      // Ensure trades is an array
      setCommunityTrades(Array.isArray(response.data.active_trades) ? response.data.active_trades : [])
      setError(null)
    } catch (err) {
      console.error("Error fetching community trades:", err)
      setError(err.response?.data?.msg || "Failed to fetch community trades")
      // Initialize with empty array on error
      setCommunityTrades([])
    }
  }

  // Handle buy energy
  const handleBuyEnergy = async () => {
    try {
      setLoading(true)
      const response = await TradingService.buyEnergy({
        amount: Number.parseFloat(buyAmount),
        max_price: currentPrice,
      })

      if (response.success) {
        // Refresh data
        fetchTradingData()
      } else {
        setError(response.error || "Failed to buy energy. Please try again.")
      }
    } catch (err) {
      console.error("Error buying energy:", err)
      setError("Failed to buy energy. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle sell energy
  const handleSellEnergy = async () => {
    try {
      if (Number.parseFloat(sellAmount) <= 0) {
        setError("No energy available to sell")
        return
      }

      setLoading(true)
      const response = await TradingService.createSellOrder({
        amount: Number.parseFloat(sellAmount),
        price_per_kwh: currentPrice,
        community_id: selectedCommunity?.id,
      })

      if (response.success) {
        // Refresh data
        fetchTradingData()
      } else {
        setError(response.error || "Failed to sell energy. Please try again.")
      }
    } catch (err) {
      console.error("Error selling energy:", err)
      setError("Failed to sell energy. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle buy specific trade
  const handleBuyTrade = async (tradeId) => {
    try {
      setLoading(true)
      const response = await TradingService.buyTrade(tradeId)

      if (response.success) {
        // Refresh data
        fetchTradingData()
      } else {
        setError(response.error || "Failed to buy trade. Please try again.")
      }
    } catch (err) {
      console.error("Error buying trade:", err)
      setError("Failed to buy trade. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle cancel trade
  const handleCancelTrade = async (tradeId) => {
    try {
      setLoading(true)
      const response = await TradingService.cancelTrade(tradeId)

      if (response.success) {
        // Refresh data
        fetchTradingData()
      } else {
        setError(response.error || "Failed to cancel trade. Please try again.")
      }
    } catch (err) {
      console.error("Error cancelling trade:", err)
      setError("Failed to cancel trade. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle save preferences
  const handleSavePreferences = async () => {
    try {
      setLoading(true)
      const response = await TradingService.updateTradingPreferences({
        autoSellEnabled,
        autoBuyEnabled,
        pricingStrategy,
        minimumSellPrice: Number.parseFloat(minimumSellPrice),
      })

      if (response.success) {
        setIsPreferencesDialogOpen(false)
        // Refresh data
        fetchTradingData()
      } else {
        setError(response.error || "Failed to save preferences. Please try again.")
      }
    } catch (err) {
      console.error("Error saving preferences:", err)
      setError("Failed to save preferences. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !marketData) {
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
          <h1 className="text-3xl font-bold text-teal-600">Trading Platform</h1>
          <p className="text-gray-600">Buy and sell energy on the P2P market</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button onClick={() => setIsPreferencesDialogOpen(true)} variant="outline">
            <FaChartBar className="mr-2" />
            Trading Preferences
          </Button>
          <Button onClick={() => fetchTradingData()} className="bg-teal-600 hover:bg-teal-700">
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

      {/* Tabs for different trading views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="community">Community Trading</TabsTrigger>
          <TabsTrigger value="history">Trading History</TabsTrigger>
          <TabsTrigger value="forecast">Price Forecast</TabsTrigger>
        </TabsList>

        {/* Market Tab */}
        <TabsContent value="market">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Marketplace Card - Takes 3/4 of the space on large screens */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaShoppingCart className="mr-2 text-teal-600" />
                  Energy Marketplace
                </CardTitle>
                <CardDescription>Buy and sell energy on the P2P market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-teal-50 to-green-50 p-4 rounded-lg border border-teal-100">
                    <h3 className="font-medium text-teal-700 mb-2">Sell Energy</h3>
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                        <FaExchangeAlt className="text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Available to Sell</p>
                        <p className="text-2xl font-bold text-teal-700">{availableEnergy} kWh</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Input
                        type="number"
                        value={sellAmount}
                        onChange={(e) => setSellAmount(e.target.value)}
                        min="0.1"
                        step="0.1"
                        max={availableEnergy}
                        className="w-24 border-teal-200 focus:ring-teal-500"
                      />
                      <span>kWh</span>
                      <span className="text-sm text-gray-500">at ${currentPrice.toFixed(2)}/kWh</span>
                    </div>
                    <Button
                      onClick={handleSellEnergy}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                      disabled={Number(sellAmount) <= 0}
                    >
                      Sell Energy
                    </Button>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="font-medium text-blue-700 mb-2">Buy Energy</h3>
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <FaMoneyBillWave className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Price</p>
                        <p className="text-2xl font-bold text-blue-700">${currentPrice.toFixed(2)}/kWh</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Input
                        type="number"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        min="0.1"
                        step="0.1"
                        className="w-24 border-blue-200 focus:ring-blue-500"
                      />
                      <span>kWh</span>
                      <span className="text-sm text-gray-500">Total: ${(buyAmount * currentPrice).toFixed(2)}</span>
                    </div>
                    <Button
                      onClick={handleBuyEnergy}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={Number(buyAmount) <= 0}
                    >
                      Buy Energy
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Active Market Listings</h3>
                  </div>
                  <div className="overflow-x-auto bg-white rounded-lg border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Seller
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Price
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Total
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Listed
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {marketData && marketData.active_trades && marketData.active_trades.length > 0 ? (
                          marketData.active_trades.map((trade) => (
                            <tr key={trade.id}>
                              <td className="px-3 py-4 whitespace-nowrap">
                                {trade.seller_id === user.id ? "You" : `User #${trade.seller_id}`}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">{trade.amount.toFixed(2)} kWh</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                ${trade.price_per_kwh.toFixed(2)}/kWh
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">${trade.total_price.toFixed(2)}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                {new Date(trade.created_at).toLocaleString()}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap">
                                {trade.seller_id === user.id ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCancelTrade(trade.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Cancel
                                  </Button>
                                ) : (
                                  <Button size="sm" onClick={() => handleBuyTrade(trade.id)}>
                                    Buy
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-3 py-4 text-center text-gray-500">
                              No active trades in the market
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Overview - Takes 1/4 of the space on large screens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaChartLine className="mr-2 text-teal-600" />
                  Market Overview
                </CardTitle>
                <CardDescription>Current market statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Current P2P Price</p>
                    <p className="text-xl font-bold text-teal-700">${currentPrice.toFixed(2)}/kWh</p>
                    <p className="text-xs text-gray-500">{priceChange} from base rate</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Market Volume</p>
                    <p className="text-xl font-bold text-teal-700">
                      {marketData?.market_volume?.toFixed(2) || "0.00"} kWh
                    </p>
                    <p className="text-xs text-gray-500">
                      {marketData?.volume_change
                        ? `${marketData.volume_change > 0 ? "+" : ""}${marketData.volume_change.toFixed(2)}% today`
                        : "No change today"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Active Trades</p>
                    <p className="text-xl font-bold text-teal-700">{marketData?.active_trades?.length || 0}</p>
                    <p className="text-xs text-gray-500">{marketData?.completed_trades_today || 0} completed today</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Your Balance</p>
                    <p className="text-xl font-bold text-teal-700">${user?.account_balance?.toFixed(2) || "0.00"}</p>
                    <p className="text-xs text-gray-500">
                      {marketData?.your_trades_today
                        ? `${marketData.your_trades_today} trades today`
                        : "No trades today"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Community Trading Tab */}
        <TabsContent value="community">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Community Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaUsers className="mr-2 text-teal-600" />
                  Your Communities
                </CardTitle>
                <CardDescription>Select a community to trade with</CardDescription>
              </CardHeader>
              <CardContent>
                {communities.length > 0 ? (
                  <div className="space-y-4">
                    {communities.map((community) => (
                      <div
                        key={community.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedCommunity?.id === community.id
                            ? "bg-teal-50 border-teal-200"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedCommunity(community)}
                      >
                        <h3 className="font-medium">{community.name}</h3>
                        <p className="text-sm text-gray-500">
                          {community.description || "A community for energy sharing"}
                        </p>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>{community.member_count || 0} members</span>
                          <span>
                            {community.is_member ? (
                              <span className="text-green-600">Member</span>
                            ) : (
                              <span className="text-gray-500">Not a member</span>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40">
                    <p className="text-gray-500 mb-4">You're not a member of any communities yet</p>
                    <Button onClick={() => navigate("/community")}>Join a Community</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Community Trading */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaExchangeAlt className="mr-2 text-teal-600" />
                  Community Energy Trading
                </CardTitle>
                <CardDescription>
                  {selectedCommunity
                    ? `Trade energy within the ${selectedCommunity.name} community`
                    : "Select a community to view trading options"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCommunity ? (
                  <>
                    <div className="bg-teal-50 p-4 rounded-lg mb-4">
                      <h3 className="font-medium text-teal-700">Trading in: {selectedCommunity.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedCommunity.member_count || 0} members in this community
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Community trading offers lower fees and supports your local energy economy
                      </p>
                    </div>

                    <div className="overflow-x-auto bg-white rounded-lg border">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Seller
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Amount
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Price
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Total
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Listed
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {communityTrades.length > 0 ? (
                            communityTrades.map((trade) => (
                              <tr key={trade.id}>
                                <td className="px-3 py-4 whitespace-nowrap">
                                  {trade.seller_id === user.id ? "You" : `User #${trade.seller_id}`}
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm">{trade.amount.toFixed(2)} kWh</td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm">
                                  ${trade.price_per_kwh.toFixed(2)}/kWh
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm">${trade.total_price.toFixed(2)}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm">
                                  {new Date(trade.created_at).toLocaleString()}
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap">
                                  {trade.seller_id === user.id ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCancelTrade(trade.id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      Cancel
                                    </Button>
                                  ) : (
                                    <Button size="sm" onClick={() => handleBuyTrade(trade.id)}>
                                      Buy
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="px-3 py-4 text-center text-gray-500">
                                <p>No active trades in this community</p>
                                <p className="text-sm mt-2">Be the first to list your excess energy for sale!</p>
                                <Button
                                  onClick={() => {
                                    setActiveTab("market")
                                    // Set community ID for selling
                                  }}
                                  className="mt-4"
                                >
                                  List Energy for Sale
                                </Button>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64">
                    <FaUsers className="text-gray-300 text-5xl mb-4" />
                    <p className="text-gray-500 mb-2">Select a community to view trading options</p>
                    <p className="text-sm text-gray-400 text-center max-w-md">
                      Community trading allows you to buy and sell energy with other members of your community at
                      preferential rates
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trading History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaHistory className="mr-2 text-teal-600" />
                Trading History
              </CardTitle>
              <CardDescription>Your past energy trades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto bg-white rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Counterparty
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tradingHistory.length > 0 ? (
                      tradingHistory.map((trade) => (
                        <tr key={trade.id}>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">
                            {new Date(trade.completed_at || trade.created_at).toLocaleString()}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                trade.seller_id === user.id
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {trade.seller_id === user.id ? "Sell" : "Buy"}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">{trade.amount.toFixed(2)} kWh</td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">${trade.price_per_kwh.toFixed(2)}/kWh</td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">${trade.total_price.toFixed(2)}</td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">
                            {trade.seller_id === user.id
                              ? `User #${trade.buyer_id || "Unknown"}`
                              : `User #${trade.seller_id}`}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                trade.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : trade.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-3 py-4 text-center text-gray-500">
                          <p>No trading history found</p>
                          <p className="text-sm mt-2">Start trading energy to see your history here</p>
                          <Button onClick={() => setActiveTab("market")} className="mt-4">
                            Go to Marketplace
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Forecast Tab */}
        <TabsContent value="forecast">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaChartLine className="mr-2 text-teal-600" />
                  Energy Price Forecast
                </CardTitle>
                <CardDescription>Predicted energy prices for the next 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                      <YAxis domain={["auto", "auto"]} tickFormatter={(price) => `$${price.toFixed(2)}`} />
                      <Tooltip
                        formatter={(value) => [`$${value.toFixed(2)}`, "Price"]}
                        labelFormatter={(hour) => `Time: ${hour}:00`}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="price" name="Market Price" stroke="#4FD1C5" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="p2p_price" name="P2P Price" stroke="#38B2AC" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <FaChartBar className="mr-2 text-teal-600" />
                    Best Time to Sell
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-teal-700">{marketData?.best_sell_time || "N/A"}</p>
                    <p className="text-sm text-gray-600">
                      {marketData?.best_sell_price
                        ? `$${marketData.best_sell_price.toFixed(2)}/kWh`
                        : "Price data unavailable"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Based on price forecast and demand patterns</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <FaChartBar className="mr-2 text-teal-600" />
                    Best Time to Buy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-teal-700">{marketData?.best_buy_time || "N/A"}</p>
                    <p className="text-sm text-gray-600">
                      {marketData?.best_buy_price
                        ? `$${marketData.best_buy_price.toFixed(2)}/kWh`
                        : "Price data unavailable"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Based on price forecast and supply patterns</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <FaChartBar className="mr-2 text-teal-600" />
                    Price Volatility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-teal-700">
                      {marketData?.price_volatility ? `${marketData.price_volatility.toFixed(2)}%` : "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">{marketData?.volatility_trend || "Trend data unavailable"}</p>
                    <p className="text-xs text-gray-500 mt-2">24-hour price fluctuation range</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Trading Preferences Dialog */}
      <Dialog open={isPreferencesDialogOpen} onOpenChange={setIsPreferencesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trading Preferences</DialogTitle>
            <DialogDescription>Configure your automated trading settings</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="auto-sell" className="text-right">
                Auto-sell surplus
              </Label>
              <div className="flex items-center col-span-3">
                <Switch id="auto-sell" checked={autoSellEnabled} onCheckedChange={setAutoSellEnabled} />
                <Label htmlFor="auto-sell" className="ml-2">
                  {autoSellEnabled ? "Enabled" : "Disabled"}
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="auto-buy" className="text-right">
                Auto-buy when deficit
              </Label>
              <div className="flex items-center col-span-3">
                <Switch id="auto-buy" checked={autoBuyEnabled} onCheckedChange={setAutoBuyEnabled} />
                <Label htmlFor="auto-buy" className="ml-2">
                  {autoBuyEnabled ? "Enabled" : "Disabled"}
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pricing-strategy" className="text-right">
                Pricing Strategy
              </Label>
              <Select value={pricingStrategy} onValueChange={setPricingStrategy}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select pricing strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="dynamic">Dynamic Price</SelectItem>
                  <SelectItem value="market">Market Following</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="min-price" className="text-right">
                Minimum Sell Price
              </Label>
              <div className="flex items-center col-span-3">
                <span className="mr-2">$</span>
                <Input
                  id="min-price"
                  type="number"
                  value={minimumSellPrice}
                  onChange={(e) => setMinimumSellPrice(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-24"
                />
                <span className="ml-2">per kWh</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreferencesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreferences}>Save Preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Trading

