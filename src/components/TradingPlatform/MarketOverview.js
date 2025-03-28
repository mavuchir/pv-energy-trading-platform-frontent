"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../ui/Card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { RefreshCw, TrendingDown, DollarSign, Zap } from "lucide-react"
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
      <Card className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Loading market data...</p>
        </div>
      </Card>
    )
  }

  if (error && !marketData) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <div className="text-center text-destructive">
          <p>{error}</p>
          <Button onClick={fetchMarketData} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Energy Market Overview</CardTitle>
          <CardDescription>Current market conditions and trading opportunities</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchMarketData} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prices">
          <TabsList className="mb-4">
            <TabsTrigger value="prices">Current Prices</TabsTrigger>
            <TabsTrigger value="trades">Active Trades</TabsTrigger>
            <TabsTrigger value="forecast">Forecasts</TabsTrigger>
          </TabsList>

          <TabsContent value="prices">
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
                      <h3 className="text-2xl font-bold">
                        ${marketData?.market_prices.grid_sell_price.toFixed(4)}/kWh
                      </h3>
                    </div>
                    <TrendingDown className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="h-64 mb-4">
              <p className="text-sm font-medium mb-2">Price History (24h)</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketData?.price_history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={formatDate} minTickGap={60} />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip
                    formatter={(value) => [`$${value.toFixed(4)}/kWh`, "Price"]}
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                  />
                  <Line type="monotone" dataKey="price" stroke="#0ea5e9" activeDot={{ r: 8 }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="trades">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Available Energy for Purchase</h3>
                <Badge variant="outline">{marketData?.active_trades.length} Listings</Badge>
              </div>

              {marketData?.active_trades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No active trades available at the moment.</p>
                  <p className="text-sm mt-2">Check back later or create your own sell order.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {marketData?.active_trades.map((trade) => (
                    <Card key={trade.id}>
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

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Market Statistics (24h)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Trading Volume</p>
                        <p className="text-2xl font-bold">{marketData?.market_stats.total_volume_24h.toFixed(2)} kWh</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Average Price</p>
                        <p className="text-2xl font-bold">${marketData?.market_stats.avg_price_24h.toFixed(4)}/kWh</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Completed Trades</p>
                        <p className="text-2xl font-bold">{marketData?.market_stats.trade_count_24h}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="forecast">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Demand Forecast (24h)</h3>
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
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Supply Forecast (24h)</h3>
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
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default MarketOverview

