"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/Input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "../../hooks/use-toast"
import api from "../../config/axios"

const EnergyTrading = ({ onTradeComplete }) => {
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [price, setPrice] = useState("")
  const [tradeType, setTradeType] = useState("sell")
  const [expiryTime, setExpiryTime] = useState("60")
  const [loading, setLoading] = useState(false)
  const [marketPrice, setMarketPrice] = useState(null)

  useEffect(() => {
    // Fetch current market price
    const fetchMarketPrice = async () => {
      try {
        const response = await api.get("/trade/current-price")
        setMarketPrice(response.data.price)
        // Set default price based on market price
        setPrice(response.data.price.toFixed(2))
      } catch (err) {
        console.error("Error fetching market price:", err)
      }
    }

    fetchMarketPrice()
  }, [])

  const handleTrade = async (type) => {
    if (!amount || !price) {
      toast({
        title: "Missing information",
        description: "Please enter both amount and price",
        variant: "destructive",
      })
      return
    }

    if (Number.parseFloat(amount) <= 0 || Number.parseFloat(price) <= 0) {
      toast({
        title: "Invalid values",
        description: "Amount and price must be greater than zero",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const endpoint = type === "Buy" ? "/trade/buy" : "/trade/sell"
      const response = await api.post(endpoint, {
        amount: Number.parseFloat(amount),
        price_per_kwh: Number.parseFloat(price),
        expiry_minutes: Number.parseInt(expiryTime),
      })

      toast({
        title: `${type} Order Placed`,
        description: `Successfully placed a ${type.toLowerCase()} order for ${amount} kWh at $${price} per kWh`,
        variant: "default",
      })

      // Reset form
      setAmount("")
      setPrice(marketPrice ? marketPrice.toFixed(2) : "")

      // Notify parent component
      if (onTradeComplete) {
        onTradeComplete(response.data)
      }
    } catch (err) {
      console.error(`Error placing ${type.toLowerCase()} order:`, err)
      toast({
        title: "Trade Failed",
        description: err.response?.data?.msg || `Failed to place ${type.toLowerCase()} order`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="trade-type">Trade Type</Label>
        <Select value={tradeType} onValueChange={setTradeType}>
          <SelectTrigger id="trade-type">
            <SelectValue placeholder="Select trade type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buy">Buy Energy</SelectItem>
            <SelectItem value="sell">Sell Energy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (kWh)</Label>
        <Input
          id="amount"
          type="number"
          placeholder="Amount (kWh)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.1"
          step="0.1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price per kWh {marketPrice && `(Current Market: $${marketPrice.toFixed(2)})`}</Label>
        <Input
          id="price"
          type="number"
          placeholder="Price per kWh"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0.01"
          step="0.01"
        />
      </div>

      {tradeType === "sell" && (
        <div className="space-y-2">
          <Label htmlFor="expiry">Listing Expiry</Label>
          <Select value={expiryTime} onValueChange={setExpiryTime}>
            <SelectTrigger id="expiry">
              <SelectValue placeholder="Select expiry time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="360">6 hours</SelectItem>
              <SelectItem value="1440">24 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex space-x-2">
        {tradeType === "buy" ? (
          <Button
            onClick={() => handleTrade("Buy")}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Processing..." : "Buy Energy"}
          </Button>
        ) : (
          <Button
            onClick={() => handleTrade("Sell")}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Processing..." : "Sell Energy"}
          </Button>
        )}
      </div>

      {Number.parseFloat(amount) > 0 && Number.parseFloat(price) > 0 && (
        <div className="text-sm text-gray-600">
          Total value: ${(Number.parseFloat(amount) * Number.parseFloat(price)).toFixed(2)}
        </div>
      )}
    </div>
  )
}

export default EnergyTrading

