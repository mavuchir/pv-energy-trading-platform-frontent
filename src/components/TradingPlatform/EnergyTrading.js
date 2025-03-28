"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../ui/Card"
import { Button } from "../ui/button"
import { Input } from "../ui/Input"
import { Label } from "../ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Switch } from "../ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table"
import { AlertCircle, CheckCircle, Battery, Zap, TrendingUp, TrendingDown, RefreshCw, Lightbulb } from "lucide-react"
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
} from "recharts"
import TradingService from "../../services/trading"
import EnergyService from "../../services/energy"

const EnergyTrading = ({ defaultTab = "sell" }) => {
  const [userTrades, setUserTrades] = useState([])
  const [batteryStatus, setBatteryStatus] = useState(null)
  const [marketPrice, setMarketPrice] = useState(0)
  const [p2pPrice, setP2pPrice] = useState(0)
  const [gridSellPrice, setGridSellPrice] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [priceForecast, setPriceForecast] = useState([])
  const [demandForecast, setDemandForecast] = useState([])

  // Form states
  const [sellAmount, setSellAmount] = useState(1)
  const [sellPrice, setSellPrice] = useState(0)
  const [sellToCommunity, setSellToCommunity] = useState(false)
  const [sellCommunityId, setSellCommunityId] = useState("")
  const [autoPrice, setAutoPrice] = useState(true)

  const [buyAmount, setBuyAmount] = useState(1)
  const [maxBuyPrice, setMaxBuyPrice] = useState(0)
  const [buyFromCommunity, setBuyFromCommunity] = useState(false)
  const [buyCommunityId, setBuyCommunityId] = useState("")
  const [autoBuyPrice, setAutoBuyPrice] = useState(true)

  const [communities, setCommunities] = useState([])
  const [optimizationData, setOptimizationData] = useState(null)

  // Fetch initial data
  useEffect(() => {
    fetchMarketData()
    fetchUserTrades()
    fetchBatteryStatus()
    fetchCommunities()
    fetchPriceForecast()
    fetchOptimizationData()
  }, [])

  const fetchMarketData = async () => {
    try {
      const response = await TradingService.getMarketOverview()

      if (response.success) {
        setMarketPrice(response.data.market_prices.current_price)
        setP2pPrice(response.data.market_prices.p2p_price)
        setGridSellPrice(response.data.market_prices.grid_sell_price)
        setSellPrice(response.data.market_prices.p2p_price)
        setMaxBuyPrice(response.data.market_prices.current_price)
        setRecommendation(response.data.recommendation)

        if (response.data.forecasts && response.data.forecasts.demand) {
          setDemandForecast(response.data.forecasts.demand)
        }
      } else {
        console.error("Error fetching market data:", response.error)
      }
    } catch (err) {
      console.error("Error fetching market data:", err)
    }
  }

  const fetchUserTrades = async () => {
    try {
      const response = await TradingService.getUserTrades()

      if (response.success) {
        setUserTrades(response.data.trades)
      } else {
        console.error("Error fetching user trades:", response.error)
      }
    } catch (err) {
      console.error("Error fetching user trades:", err)
    }
  }

  const fetchBatteryStatus = async () => {
    try {
      const response = await EnergyService.getRealTimeData()

      if (response.success) {
        setBatteryStatus({
          percentage: response.data.batteryLevel,
          currentCharge: response.data.batteryLevel * 0.1, // Assuming 10kWh capacity for example
          maxCharge: 10, // Example value
        })
      } else {
        console.error("Error fetching battery status:", response.error)
      }
    } catch (err) {
      console.error("Error fetching battery status:", err)
    }
  }

  const fetchCommunities = async () => {
    try {
      const response = await TradingService.getUserCommunities()

      if (response.success) {
        setCommunities(response.data)
      } else {
        console.error("Error fetching communities:", response.error)
      }
    } catch (err) {
      console.error("Error fetching communities:", err)
    }
  }

  const fetchPriceForecast = async () => {
    try {
      const response = await TradingService.getPriceForecast()

      if (response.success) {
        setPriceForecast(response.data.forecast)
      } else {
        console.error("Error fetching price forecast:", response.error)
      }
    } catch (err) {
      console.error("Error fetching price forecast:", err)
    }
  }

  const fetchOptimizationData = async () => {
    try {
      const response = await TradingService.getEnergyOptimization()

      if (response.success) {
        setOptimizationData(response.data.optimization)
      } else {
        console.error("Error fetching optimization data:", response.error)
      }
    } catch (err) {
      console.error("Error fetching optimization data:", err)
    }
  }

  const handleSellSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        amount: Number.parseFloat(sellAmount),
        price_per_kwh: autoPrice ? undefined : Number.parseFloat(sellPrice),
        expiry_hours: 24,
        auto_price: autoPrice,
      }

      if (sellToCommunity && sellCommunityId) {
        payload.community_id = Number.parseInt(sellCommunityId)
      }

      const response = await TradingService.createSellOrder(payload)

      if (response.success) {
        setSuccess("Your energy has been listed for sale successfully!")
        fetchUserTrades()
        fetchBatteryStatus()

        // If there's a recommendation, show it
        if (response.data.recommendation) {
          setRecommendation(response.data.recommendation)
        }

        // Reset form
        setSellAmount(1)
        setSellPrice(p2pPrice)
      } else {
        setError(response.error)
      }
    } catch (err) {
      console.error("Error creating sell order:", err)
      setError("Failed to create sell order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBuySubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        amount: Number.parseFloat(buyAmount),
        max_price: autoBuyPrice ? undefined : Number.parseFloat(maxBuyPrice),
        auto_price: autoBuyPrice,
      }

      if (buyFromCommunity && buyCommunityId) {
        payload.community_id = Number.parseInt(buyCommunityId)
      }

      const response = await TradingService.buyEnergy(payload)

      if (response.success) {
        setSuccess("Energy purchased successfully!")
        fetchUserTrades()
        fetchBatteryStatus()

        // Reset form
        setBuyAmount(1)
        setMaxBuyPrice(marketPrice)
      } else {
        setError(response.error)
      }
    } catch (err) {
      console.error("Error buying energy:", err)
      setError("Failed to buy energy. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelTrade = async (tradeId) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await TradingService.cancelTrade(tradeId)

      if (response.success) {
        setSuccess("Trade cancelled successfully!")
        fetchUserTrades()
        fetchBatteryStatus()
      } else {
        setError(response.error)
      }
    } catch (err) {
      console.error("Error cancelling trade:", err)
      setError("Failed to cancel trade. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSellToGrid = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await TradingService.sellToGrid(Number.parseFloat(sellAmount))

      if (response.success) {
        setSuccess("Energy sold to grid successfully!")
        fetchBatteryStatus()

        // Reset form
        setSellAmount(1)
      } else {
        setError(response.error)
      }
    } catch (err) {
      console.error("Error selling to grid:", err)
      setError("Failed to sell energy to grid. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBuyFromGrid = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await TradingService.buyFromGrid(Number.parseFloat(buyAmount))

      if (response.success) {
        setSuccess("Energy purchased from grid successfully!")
        fetchBatteryStatus()

        // Reset form
        setBuyAmount(1)
      } else {
        setError(response.error)
      }
    } catch (err) {
      console.error("Error buying from grid:", err)
      setError("Failed to buy energy from grid. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getOptimalTradingTime = () => {
    if (!priceForecast || priceForecast.length === 0) return null

    // For selling: find highest price in next 24 hours
    const bestSellTime = [...priceForecast].sort((a, b) => b.grid_sell_price - a.grid_sell_price)[0]

    // For buying: find lowest price in next 24 hours
    const bestBuyTime = [...priceForecast].sort((a, b) => a.price - b.price)[0]

    return {
      sell: bestSellTime,
      buy: bestBuyTime,
    }
  }

  const optimalTimes = getOptimalTradingTime()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Energy Trading Platform</CardTitle>
          <CardDescription>Buy and sell energy in the peer-to-peer marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="sell">Sell Energy</TabsTrigger>
              <TabsTrigger value="buy">Buy Energy</TabsTrigger>
              <TabsTrigger value="history">Trading History</TabsTrigger>
              <TabsTrigger value="optimize">Smart Optimization</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {recommendation && (
              <Alert
                className={`mb-4 
                ${
                  recommendation.decision === "store"
                    ? "bg-blue-50 border-blue-200"
                    : recommendation.decision === "sell_p2p"
                      ? "bg-green-50 border-green-200"
                      : recommendation.decision === "sell_grid"
                        ? "bg-amber-50 border-amber-200"
                        : "bg-gray-50 border-gray-200"
                }`}
              >
                <Lightbulb
                  className={`h-4 w-4 
                  ${
                    recommendation.decision === "store"
                      ? "text-blue-600"
                      : recommendation.decision === "sell_p2p"
                        ? "text-green-600"
                        : recommendation.decision === "sell_grid"
                          ? "text-amber-600"
                          : "text-gray-600"
                  }`}
                />
                <AlertTitle
                  className={`
                  ${
                    recommendation.decision === "store"
                      ? "text-blue-600"
                      : recommendation.decision === "sell_p2p"
                        ? "text-green-600"
                        : recommendation.decision === "sell_grid"
                          ? "text-amber-600"
                          : "text-gray-600"
                  }`}
                >
                  Recommendation:{" "}
                  {recommendation.decision === "store"
                    ? "Store Energy"
                    : recommendation.decision === "sell_p2p"
                      ? "Sell on P2P Market"
                      : recommendation.decision === "sell_grid"
                        ? "Sell to Grid"
                        : "No Recommendation"}
                </AlertTitle>
                <AlertDescription>{recommendation.reason}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="sell">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <form onSubmit={handleSellSubmit}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="sellAmount">Amount to Sell (kWh)</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            id="sellAmount"
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={sellAmount}
                            onChange={(e) => setSellAmount(e.target.value)}
                            required
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => batteryStatus && setSellAmount(batteryStatus.currentCharge.toFixed(1))}
                          >
                            Max
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch id="autoPrice" checked={autoPrice} onCheckedChange={setAutoPrice} />
                        <Label htmlFor="autoPrice">Use dynamic pricing (recommended)</Label>
                      </div>

                      {!autoPrice && (
                        <div>
                          <Label htmlFor="sellPrice">Price per kWh ($)</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Input
                              id="sellPrice"
                              type="number"
                              min="0.01"
                              step="0.001"
                              value={sellPrice}
                              onChange={(e) => setSellPrice(e.target.value)}
                              required
                            />
                            <Button type="button" variant="outline" onClick={() => setSellPrice(p2pPrice)}>
                              Market
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Recommended P2P price: ${p2pPrice.toFixed(4)}/kWh
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Switch id="sellToCommunity" checked={sellToCommunity} onCheckedChange={setSellToCommunity} />
                        <Label htmlFor="sellToCommunity">Sell to community only</Label>
                      </div>

                      {sellToCommunity && (
                        <div>
                          <Label htmlFor="sellCommunityId">Select Community</Label>
                          <Select value={sellCommunityId} onValueChange={setSellCommunityId} required={sellToCommunity}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a community" />
                            </SelectTrigger>
                            <SelectContent>
                              {communities.map((community) => (
                                <SelectItem key={community.id} value={community.id.toString()}>
                                  {community.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="pt-4 flex space-x-2">
                        <Button type="submit" disabled={loading} className="flex-1">
                          {loading ? "Processing..." : "List for Sale"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSellToGrid}
                          disabled={loading}
                          className="flex-1"
                        >
                          Sell to Grid
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>

                <div>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Battery Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {batteryStatus ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Battery className="h-8 w-8 text-primary" />
                            <span className="text-2xl font-bold">{batteryStatus.percentage.toFixed(1)}%</span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-primary h-2.5 rounded-full"
                              style={{ width: `${batteryStatus.percentage}%` }}
                            ></div>
                          </div>

                          <div className="text-sm">
                            <p>Current charge: {batteryStatus.currentCharge.toFixed(2)} kWh</p>
                            <p>Maximum capacity: {batteryStatus.maxCharge.toFixed(2)} kWh</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Loading battery status...</p>
                      )}
                    </CardContent>
                  </Card>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Market Prices</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted p-2 rounded">
                        <p className="text-xs text-muted-foreground">Grid Buy</p>
                        <p className="font-medium">${marketPrice.toFixed(4)}/kWh</p>
                      </div>
                      <div className="bg-muted p-2 rounded">
                        <p className="text-xs text-muted-foreground">P2P</p>
                        <p className="font-medium">${p2pPrice.toFixed(4)}/kWh</p>
                      </div>
                      <div className="bg-muted p-2 rounded">
                        <p className="text-xs text-muted-foreground">Grid Sell</p>
                        <p className="font-medium">${gridSellPrice.toFixed(4)}/kWh</p>
                      </div>
                      <div className="bg-muted p-2 rounded">
                        <p className="text-xs text-muted-foreground">Potential Profit</p>
                        <p className="font-medium text-green-600">
                          ${((p2pPrice - gridSellPrice) * sellAmount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {optimalTimes && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Optimal Selling Time</h3>
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <p className="text-sm">
                          Best time to sell: <span className="font-medium">{optimalTimes.sell.hour}:00</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Price: ${optimalTimes.sell.grid_sell_price.toFixed(4)}/kWh
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {optimalTimes.sell.grid_sell_price > gridSellPrice
                            ? `${(((optimalTimes.sell.grid_sell_price - gridSellPrice) / gridSellPrice) * 100).toFixed(1)}% higher than current price`
                            : "Current price is optimal"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="buy">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <form onSubmit={handleBuySubmit}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="buyAmount">Amount to Buy (kWh)</Label>
                        <Input
                          id="buyAmount"
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={buyAmount}
                          onChange={(e) => setBuyAmount(e.target.value)}
                          required
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch id="autoBuyPrice" checked={autoBuyPrice} onCheckedChange={setAutoBuyPrice} />
                        <Label htmlFor="autoBuyPrice">Use dynamic pricing (recommended)</Label>
                      </div>

                      {!autoBuyPrice && (
                        <div>
                          <Label htmlFor="maxBuyPrice">Maximum Price per kWh ($)</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Input
                              id="maxBuyPrice"
                              type="number"
                              min="0.01"
                              step="0.001"
                              value={maxBuyPrice}
                              onChange={(e) => setMaxBuyPrice(e.target.value)}
                              required
                            />
                            <Button type="button" variant="outline" onClick={() => setMaxBuyPrice(marketPrice)}>
                              Market
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Current grid price: ${marketPrice.toFixed(4)}/kWh
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="buyFromCommunity"
                          checked={buyFromCommunity}
                          onCheckedChange={setBuyFromCommunity}
                        />
                        <Label htmlFor="buyFromCommunity">Buy from community only</Label>
                      </div>

                      {buyFromCommunity && (
                        <div>
                          <Label htmlFor="buyCommunityId">Select Community</Label>
                          <Select value={buyCommunityId} onValueChange={setBuyCommunityId} required={buyFromCommunity}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a community" />
                            </SelectTrigger>
                            <SelectContent>
                              {communities.map((community) => (
                                <SelectItem key={community.id} value={community.id.toString()}>
                                  {community.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="pt-4 flex space-x-2">
                        <Button type="submit" disabled={loading} className="flex-1">
                          {loading ? "Processing..." : "Buy from P2P Market"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBuyFromGrid}
                          disabled={loading}
                          className="flex-1"
                        >
                          Buy from Grid
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>

                <div>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Energy Flow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">P2P Market</p>
                            <div className="flex items-center">
                              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-green-500 font-medium">Save up to 15%</span>
                            </div>
                          </div>
                          <Zap className="h-6 w-6 text-primary" />
                        </div>

                        <div className="h-px bg-muted my-2" />

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Grid</p>
                            <p className="text-sm">Standard utility rates</p>
                          </div>
                          <TrendingUp className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Estimated Costs</h3>
                    <div className="space-y-2">
                      <div className="bg-muted p-2 rounded">
                        <p className="text-xs text-muted-foreground">P2P Market (est.)</p>
                        <p className="font-medium">${(buyAmount * p2pPrice).toFixed(2)}</p>
                      </div>
                      <div className="bg-muted p-2 rounded">
                        <p className="text-xs text-muted-foreground">Grid Price</p>
                        <p className="font-medium">${(buyAmount * marketPrice).toFixed(2)}</p>
                      </div>
                      <div className="bg-muted p-2 rounded">
                        <p className="text-xs text-muted-foreground">Potential Savings</p>
                        <p className="font-medium text-green-600">
                          ${(buyAmount * (marketPrice - p2pPrice)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {optimalTimes && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Optimal Buying Time</h3>
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-sm">
                          Best time to buy: <span className="font-medium">{optimalTimes.buy.hour}:00</span>
                        </p>
                        <p className="text-xs text-muted-foreground">Price: ${optimalTimes.buy.price.toFixed(4)}/kWh</p>
                        <p className="text-xs text-blue-600 mt-1">
                          {optimalTimes.buy.price < marketPrice
                            ? `${(((marketPrice - optimalTimes.buy.price) / marketPrice) * 100).toFixed(1)}% lower than current price`
                            : "Current price is optimal"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTrades.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                          No trading history found
                        </TableCell>
                      </TableRow>
                    ) : (
                      userTrades.map((trade) => (
                        <TableRow key={trade.id}>
                          <TableCell>{new Date(trade.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {trade.role === "seller" ? (
                              <span className="flex items-center text-green-600">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                Sell
                              </span>
                            ) : (
                              <span className="flex items-center text-blue-600">
                                <TrendingDown className="h-4 w-4 mr-1" />
                                Buy
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{trade.amount.toFixed(2)} kWh</TableCell>
                          <TableCell>${trade.price_per_kwh.toFixed(4)}</TableCell>
                          <TableCell>${trade.total_price.toFixed(2)}</TableCell>
                          <TableCell>
                            {trade.status === "pending" && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                            {trade.status === "completed" && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            )}
                            {trade.status === "cancelled" && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Cancelled
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {trade.status === "pending" && trade.role === "seller" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelTrade(trade.id)}
                                disabled={loading}
                              >
                                Cancel
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="optimize">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Smart Energy Optimization</CardTitle>
                    <CardDescription>AI-powered recommendations for maximizing energy value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {optimizationData ? (
                      <div className="space-y-4">
                        <Alert
                          className={`
                          ${
                            optimizationData.recommendation.decision === "store"
                              ? "bg-blue-50 border-blue-200"
                              : optimizationData.recommendation.decision === "sell_p2p"
                                ? "bg-green-50 border-green-200"
                                : optimizationData.recommendation.decision === "sell_grid"
                                  ? "bg-amber-50 border-amber-200"
                                  : "bg-gray-50 border-gray-200"
                          }
                        `}
                        >
                          <Lightbulb
                            className={`h-4 w-4 
                            ${
                              optimizationData.recommendation.decision === "store"
                                ? "text-blue-600"
                                : optimizationData.recommendation.decision === "sell_p2p"
                                  ? "text-green-600"
                                  : optimizationData.recommendation.decision === "sell_grid"
                                    ? "text-amber-600"
                                    : "text-gray-600"
                            }
                          `}
                          />
                          <AlertTitle>Optimal Strategy</AlertTitle>
                          <AlertDescription>{optimizationData.recommendation.reason}</AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Current Conditions</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-muted p-2 rounded">
                              <p className="text-xs text-muted-foreground">Battery Level</p>
                              <p className="font-medium">{optimizationData.battery_status.percentage.toFixed(1)}%</p>
                            </div>
                            <div className="bg-muted p-2 rounded">
                              <p className="text-xs text-muted-foreground">Market Price</p>
                              <p className="font-medium">
                                ${optimizationData.market_conditions.market_price.toFixed(4)}/kWh
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Optimization Strategy</h3>
                          <div className="bg-muted p-3 rounded">
                            {optimizationData.recommendation.decision === "store" && (
                              <p className="text-sm">
                                Store energy in your battery now. Based on demand forecasts, you'll need this energy
                                later when prices are higher or during predicted high consumption periods.
                              </p>
                            )}
                            {optimizationData.recommendation.decision === "sell_p2p" && (
                              <p className="text-sm">
                                Sell your excess energy on the P2P market now. Current P2P prices are favorable at $
                                {optimizationData.market_conditions.p2p_price.toFixed(4)}/kWh, which is
                                {(
                                  ((optimizationData.market_conditions.p2p_price -
                                    optimizationData.market_conditions.grid_sell_price) /
                                    optimizationData.market_conditions.grid_sell_price) *
                                  100
                                ).toFixed(1)}
                                % higher than grid sell-back.
                              </p>
                            )}
                            {optimizationData.recommendation.decision === "sell_grid" && (
                              <p className="text-sm">
                                Sell your excess energy to the grid now. Current grid sell-back price is $
                                {optimizationData.market_conditions.grid_sell_price.toFixed(4)}/kWh, and there are
                                limited P2P market opportunities at this time.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-64">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                        <p>Loading optimization data...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Demand & Price Forecast</CardTitle>
                    <CardDescription>Predicted energy needs and market conditions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Demand Forecast</h3>
                        {demandForecast && demandForecast.length > 0 ? (
                          <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsBarChart data={demandForecast}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                                <YAxis />
                                <Tooltip
                                  formatter={(value) => [`${value.toFixed(2)} kWh`, "Demand"]}
                                  labelFormatter={(hour) => `${hour}:00`}
                                />
                                <Bar dataKey="demand" fill="#f97316" name="Predicted Demand" />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="flex justify-center items-center h-40 bg-gray-50 rounded-md">
                            <p className="text-gray-500">No demand forecast available</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Price Forecast</h3>
                        {priceForecast && priceForecast.length > 0 ? (
                          <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={priceForecast}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                                <YAxis />
                                <Tooltip
                                  formatter={(value) => [`$${value.toFixed(4)}/kWh`, "Price"]}
                                  labelFormatter={(hour) => `${hour}:00`}
                                />
                                <Line type="monotone" dataKey="price" stroke="#0ea5e9" name="Grid Price" />
                                <Line type="monotone" dataKey="p2p_price" stroke="#10b981" name="P2P Price" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="flex justify-center items-center h-40 bg-gray-50 rounded-md">
                            <p className="text-gray-500">No price forecast available</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Trading Tips</h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start">
                            <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                              1
                            </span>
                            <span>
                              Sell excess energy during peak demand hours (6-9 AM, 5-10 PM) when prices are highest
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                              2
                            </span>
                            <span>
                              Buy energy during off-peak hours when prices are lowest (typically 11 PM - 5 AM)
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                              3
                            </span>
                            <span>Maintain battery between 30-80% for optimal lifespan and energy flexibility</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnergyTrading

