"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/Card"
import { Button } from "../ui/button"
import { Input } from "../ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { DollarSign, Zap, TrendingUp } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs"

const TradingPlatform = () => {
  const [marketData, setMarketData] = useState(null)
  const [orderBook, setOrderBook] = useState([])
  const [tradeHistory, setTradeHistory] = useState([])
  const [walletBalance, setWalletBalance] = useState(0)
  const [selectedTradingOption, setSelectedTradingOption] = useState("spot")
  const [sellAmount, setSellAmount] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [expiryTime, setExpiryTime] = useState("15")
  const [autoAccept, setAutoAccept] = useState(false)

  useEffect(() => {
    // Mock data fetch
    setMarketData({
      totalAvailable: 1000,
      totalSold: 500,
      currentPrice: 0.12,
    })

    setOrderBook([
      { id: 1, seller: "User A", amount: 5, price: 0.12, expiry: "15 min" },
      { id: 2, seller: "User B", amount: 10, price: 0.11, expiry: "20 min" },
      { id: 3, seller: "User C", amount: 2, price: 0.13, expiry: "10 min" },
    ])

    setTradeHistory([
      { id: 1, type: "Buy", amount: 3, price: 0.12, total: 0.36, timestamp: "2023-05-01 10:30" },
      { id: 2, type: "Sell", amount: 5, price: 0.11, total: 0.55, timestamp: "2023-05-01 11:15" },
    ])

    setWalletBalance(100.5)
  }, [])

  const handleBuy = (orderId) => {
    console.log("Buy order", orderId)
  }

  const handleSell = (e) => {
    e.preventDefault()
    console.log("Sell order placed", { sellAmount, minPrice, expiryTime, autoAccept })
  }

  const generateChartData = () => {
    const data = []
    for (let i = 0; i < 24; i++) {
      data.push({
        time: `${i}:00`,
        price: 0.1 + Math.random() * 0.05,
      })
    }
    return data
  }

  const chartData = generateChartData()

  if (!marketData) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Live Energy Trading Market</h1>

      <Tabs defaultValue="market">
        <TabsList>
          <TabsTrigger value="market">Market Overview</TabsTrigger>
          <TabsTrigger value="trading">Trading Options</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
          <TabsTrigger value="wallet">Wallet & Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="market">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Energy Available</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketData.totalAvailable} kWh</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Energy Sold</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketData.totalSold} kWh</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Current Market Price</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${marketData.currentPrice.toFixed(2)}/kWh</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Wallet Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${walletBalance.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Energy Price Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="price" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading">
          <Card>
            <CardHeader>
              <CardTitle>Trading Options</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedTradingOption} onValueChange={setSelectedTradingOption}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Trading Option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spot">Spot Market Trading</SelectItem>
                  <SelectItem value="scheduled">Scheduled Trading</SelectItem>
                  <SelectItem value="p2p">Peer-to-Peer Trading</SelectItem>
                </SelectContent>
              </Select>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Order Book</CardTitle>
                  <CardDescription>Live Buy/Sell Listings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seller</TableHead>
                        <TableHead>Available Energy (kWh)</TableHead>
                        <TableHead>Price ($/kWh)</TableHead>
                        <TableHead>Expiry Time</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderBook.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.seller}</TableCell>
                          <TableCell>{order.amount} kWh</TableCell>
                          <TableCell>${order.price.toFixed(2)}</TableCell>
                          <TableCell>{order.expiry}</TableCell>
                          <TableCell>
                            <Button onClick={() => handleBuy(order.id)}>Buy Now</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Place Order</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSell} className="space-y-4">
                <div>
                  <label htmlFor="sellAmount" className="block text-sm font-medium text-gray-700">
                    Amount to Sell (kWh)
                  </label>
                  <Input
                    id="sellAmount"
                    type="number"
                    placeholder="Enter amount"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">
                    Minimum Acceptable Price ($/kWh)
                  </label>
                  <Input
                    id="minPrice"
                    type="number"
                    step="0.01"
                    placeholder="Enter price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
                    Expiry Time
                  </label>
                  <Select value={expiryTime} onValueChange={setExpiryTime}>
                    <SelectTrigger id="expiry">
                      <SelectValue placeholder="Select expiry time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={autoAccept}
                      onChange={() => setAutoAccept(!autoAccept)}
                      className="mr-2"
                    />
                    <span>Auto-Accept Buyers?</span>
                  </label>
                </div>
                <Button type="submit" className="w-full">
                  Submit Listing
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Trade History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount (kWh)</TableHead>
                    <TableHead>Price ($/kWh)</TableHead>
                    <TableHead>Total ($)</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tradeHistory.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>{trade.type}</TableCell>
                      <TableCell>{trade.amount}</TableCell>
                      <TableCell>${trade.price.toFixed(2)}</TableCell>
                      <TableCell>${trade.total.toFixed(2)}</TableCell>
                      <TableCell>{trade.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Export Transactions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle>Wallet & Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your current wallet balance is ${walletBalance.toFixed(2)}</p>
              <Button className="mt-4 mr-2" variant="outline">
                Deposit Funds
              </Button>
              <Button className="mt-4" variant="outline">
                Withdraw Funds
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TradingPlatform

