"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../ui/Card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { RefreshCw, TrendingDown, DollarSign, Zap, Info, Clock, AlertTriangle } from "lucide-react"
import TradingService from "../../services/trading"

const MarketOverview = () => {
  const [marketData, setMarketData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [priceForecast, setPriceForecast] = useState([])
  const [forecastLoading, setForecastLoading] = useState(false)

  const fetchMarketData = async () => {
    try {
      setRefreshing(true)
      const response = await TradingService.getMarketOverview()

      if (response.success) {
        setMarketData(response.data)
        setError(null)
      } else {
        setError(response.error)
      }
    } catch (err) {
      console.error("Error fetching market data:", err)
      setError("Failed to load market data. Please try again later.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchPriceForecast = async () => {
    try {
      setForecastLoading(true)
      const response = await TradingService.getPriceForecast()

      if (response.success) {
        setPriceForecast(response.data.forecast)
      }
    } catch (err) {
      console.error("Error fetching price forecast:", err)
    } finally {
      setForecastLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()
    fetchPriceForecast()

    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchMarketData()
    }, 300000)

    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatHour = (hour) => {
    return `${hour}:00`
  }

  if (loading && !marketData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Loading market data...</p>
        </div>
      </div>
    )
  }

  if (error && !marketData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-destructive">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
          <p>{error}</p>
          <Button onClick={fetchMarketData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Energy Market Overview</h2>
          <p className="text-muted-foreground">Current market conditions and trading opportunities</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMarketData} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Grid Price</p>
                <h3 className="text-2xl font-bold">${marketData?.market_prices.current_price.toFixed(4)}/kWh</h3>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">P2P Price</p>
                <h3 className="text-2xl font-bold">${marketData?.market_prices.p2p_price.toFixed(4)}/kWh</h3>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Grid Sell Price</p>
                <h3 className="text-2xl font-bold">${marketData?.market_prices.grid_sell_price.toFixed(4)}/kWh</h3>
              </div>
              <TrendingDown className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prices" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="prices">Price Charts</TabsTrigger>
          <TabsTrigger value="trades">Order Book</TabsTrigger>
          <TabsTrigger value="forecast">Market Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="prices">
          <Card>
            <CardHeader>
              <CardTitle>Price History (24h)</CardTitle>
              <CardDescription>Historical energy price fluctuations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={marketData?.price_history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={formatDate} minTickGap={60} />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip
                      formatter={(value) => [`$${value.toFixed(4)}/kWh`, "Price"]}
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                      name="Grid Price"
                      stroke="#0ea5e9"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card>
            <CardHeader>
              <CardTitle>Available Energy for Purchase</CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>Current listings in the marketplace</span>
                <Badge variant="outline">{marketData?.active_trades.length} Listings</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {marketData?.active_trades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No active trades available at the moment.</p>
                  <p className="text-sm mt-2">Check back later or create your own sell order.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {marketData?.active_trades.map((trade) => (
                    <Card key={trade.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{trade.amount.toFixed(2)} kWh</p>
                            <p className="text-sm text-muted-foreground">
                              ${trade.price_per_kwh.toFixed(4)}/kWh · Total: ${trade.total_price.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                const response = await TradingService.buyEnergy({ trade_id: trade.id })
                                if (response.success) {
                                  fetchMarketData()
                                  alert("Energy purchased successfully!")
                                } else {
                                  alert(response.error || "Failed to purchase energy")
                                }
                              } catch (err) {
                                console.error("Error buying energy:", err)
                                alert("An error occurred while purchasing energy")
                              }
                            }}
                          >
                            Buy Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Trading Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">{marketData?.market_stats.total_volume_24h.toFixed(2)} kWh</p>
                  <p className="text-sm text-muted-foreground">Last 24 hours</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Average Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">${marketData?.market_stats.avg_price_24h.toFixed(4)}/kWh</p>
                  <p className="text-sm text-muted-foreground">Last 24 hours</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Completed Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">{marketData?.market_stats.trade_count_24h}</p>
                  <p className="text-sm text-muted-foreground">Last 24 hours</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Demand Forecast (24h)</CardTitle>
                <CardDescription>Predicted energy consumption</CardDescription>
              </CardHeader>
              <CardContent>
                {marketData?.forecasts?.demand && marketData.forecasts.demand.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marketData.forecasts.demand}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" tickFormatter={formatHour} />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${value.toFixed(2)} kWh`, "Demand"]}
                          labelFormatter={(hour) => `${hour}:00`}
                        />
                        <Bar dataKey="demand" fill="#f97316" name="Predicted Demand" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No demand forecast available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supply Forecast (24h)</CardTitle>
                <CardDescription>Predicted energy generation</CardDescription>
              </CardHeader>
              <CardContent>
                {marketData?.forecasts?.supply && marketData.forecasts.supply.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marketData.forecasts.supply}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" tickFormatter={formatHour} />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${value.toFixed(2)} kWh`, "Generation"]}
                          labelFormatter={(hour) => `${hour}:00`}
                        />
                        <Bar dataKey="generation" fill="#10b981" name="Predicted Generation" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No supply forecast available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Price Forecast (24h)</CardTitle>
              <CardDescription>Predicted energy prices</CardDescription>
            </CardHeader>
            <CardContent>
              {priceForecast && priceForecast.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceForecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tickFormatter={formatHour} />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`$${value.toFixed(4)}/kWh`, "Price"]}
                        labelFormatter={(hour) => `${hour}:00`}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="price"
                        name="Grid Price"
                        stroke="#0ea5e9"
                        fill="#0ea5e9"
                        fillOpacity={0.2}
                      />
                      <Area
                        type="monotone"
                        dataKey="p2p_price"
                        name="P2P Price"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.2}
                      />
                      <Area
                        type="monotone"
                        dataKey="grid_sell_price"
                        name="Grid Sell Price"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No price forecast available</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <div className="flex items-center text-sm text-muted-foreground">
                <Info className="h-4 w-4 mr-2" />
                <span>Forecasts are based on historical data and market conditions</span>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MarketOverview

