"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/Card"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/Input"
import { Label } from "../ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { useToast } from "../../hooks/use-toast"
import { useAuth } from "../../contexts/AuthContext"
import communityService from "../../services/community"
import tradingService from "../../services/trading"
import { FaExclamationTriangle, FaUsers, FaPlus, FaInfoCircle } from "react-icons/fa"

const CommunityTrading = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [communities, setCommunities] = useState([])
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [communityTrades, setCommunityTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSellDialog, setShowSellDialog] = useState(false)
  const [sellOrder, setSellOrder] = useState({
    amount: 1.0,
    price_per_kwh: 0.12,
    community_id: null,
    expiry_hours: 24,
    auto_price: false,
  })
  const [tradeDetails, setTradeDetails] = useState(null)
  const [showTradeDetails, setShowTradeDetails] = useState(false)

  useEffect(() => {
    fetchUserCommunities()
  }, [])

  useEffect(() => {
    if (selectedCommunity) {
      fetchCommunityTrades(selectedCommunity)
      setSellOrder((prev) => ({ ...prev, community_id: selectedCommunity }))
    }
  }, [selectedCommunity])

  const fetchUserCommunities = async () => {
    try {
      setLoading(true)
      const response = await communityService.listCommunities()

      // Filter to only include communities the user is a member of
      const userCommunities = response.communities.filter((community) => community.is_member)
      setCommunities(userCommunities)

      // Auto-select the first community if available
      if (userCommunities.length > 0 && !selectedCommunity) {
        setSelectedCommunity(userCommunities[0].id.toString())
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching communities:", err)
      setError(err.response?.data?.msg || "Failed to fetch communities")
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunityTrades = async (communityId) => {
    try {
      setLoading(true)
      const response = await tradingService.getMarketData({ community_id: communityId })
      setCommunityTrades(response.active_trades || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching community trades:", err)
      setError(err.response?.data?.msg || "Failed to fetch community trades")
    } finally {
      setLoading(false)
    }
  }

  const handleBuyEnergy = async (tradeId) => {
    try {
      setLoading(true)
      await tradingService.buyEnergy(tradeId)

      toast({
        title: "Energy Purchased",
        description: "You have successfully purchased energy from this community member",
      })

      // Refresh trades
      fetchCommunityTrades(selectedCommunity)

      setError(null)
    } catch (err) {
      console.error("Error buying energy:", err)
      setError(err.response?.data?.msg || "Failed to purchase energy")

      toast({
        title: "Purchase Failed",
        description: err.response?.data?.msg || "Failed to purchase energy",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelTrade = async (tradeId) => {
    try {
      setLoading(true)
      await tradingService.cancelTrade(tradeId)

      toast({
        title: "Trade Cancelled",
        description: "Your trade listing has been cancelled",
      })

      // Refresh trades
      fetchCommunityTrades(selectedCommunity)

      setError(null)
    } catch (err) {
      console.error("Error cancelling trade:", err)
      setError(err.response?.data?.msg || "Failed to cancel trade")

      toast({
        title: "Cancellation Failed",
        description: err.response?.data?.msg || "Failed to cancel trade",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSellOrder = async () => {
    try {
      setLoading(true)
      await tradingService.createSellOrder(sellOrder)

      toast({
        title: "Sell Order Created",
        description: "Your energy is now listed for sale in the community",
      })

      // Reset form and close dialog
      setSellOrder({
        amount: 1.0,
        price_per_kwh: 0.12,
        community_id: selectedCommunity,
        expiry_hours: 24,
        auto_price: false,
      })
      setShowSellDialog(false)

      // Refresh trades
      fetchCommunityTrades(selectedCommunity)

      setError(null)
    } catch (err) {
      console.error("Error creating sell order:", err)
      setError(err.response?.data?.msg || "Failed to create sell order")

      toast({
        title: "Error",
        description: err.response?.data?.msg || "Failed to create sell order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const viewTradeDetails = (trade) => {
    setTradeDetails(trade)
    setShowTradeDetails(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FaUsers className="mr-2" />
          Community Energy Trading
        </CardTitle>
        <CardDescription>Trade energy directly with members of your community at favorable rates</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <div className="flex items-center text-red-600">
              <FaExclamationTriangle className="mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {communities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You are not a member of any communities</p>
            <Button onClick={() => (window.location.href = "/community")} className="mt-4">
              Join a Community
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Community</label>
                <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
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
              <Button onClick={() => setShowSellDialog(true)} className="flex items-center">
                <FaPlus className="mr-2" />
                Sell Energy
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : communityTrades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No active trades in this community</p>
                <p className="text-sm mt-2">Be the first to list your excess energy for sale!</p>
                <Button onClick={() => setShowSellDialog(true)} className="mt-4">
                  List Energy for Sale
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Seller</th>
                      <th className="px-4 py-2 text-left">Amount (kWh)</th>
                      <th className="px-4 py-2 text-left">Price ($/kWh)</th>
                      <th className="px-4 py-2 text-left">Total ($)</th>
                      <th className="px-4 py-2 text-left">Listed</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {communityTrades.map((trade) => (
                      <tr key={trade.id} className="border-b">
                        <td className="px-4 py-2">
                          {trade.seller_id === user.id ? "You" : `User #${trade.seller_id}`}
                        </td>
                        <td className="px-4 py-2">{trade.amount.toFixed(2)}</td>
                        <td className="px-4 py-2">${trade.price_per_kwh.toFixed(4)}</td>
                        <td className="px-4 py-2">${trade.total_price.toFixed(2)}</td>
                        <td className="px-4 py-2">{new Date(trade.created_at).toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => viewTradeDetails(trade)}>
                              <FaInfoCircle className="mr-1" />
                              Details
                            </Button>
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
                              <Button size="sm" onClick={() => handleBuyEnergy(trade.id)}>
                                Buy
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Sell Energy Dialog */}
        <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sell Energy to Community</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (kWh)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={sellOrder.amount}
                  onChange={(e) => setSellOrder({ ...sellOrder, amount: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="price">Price per kWh ($)</Label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="auto-price"
                      checked={sellOrder.auto_price}
                      onChange={(e) => setSellOrder({ ...sellOrder, auto_price: e.target.checked })}
                      className="mr-2"
                    />
                    <Label htmlFor="auto-price" className="text-sm">
                      Auto Price
                    </Label>
                  </div>
                </div>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={sellOrder.price_per_kwh}
                  onChange={(e) => setSellOrder({ ...sellOrder, price_per_kwh: Number.parseFloat(e.target.value) })}
                  disabled={sellOrder.auto_price}
                />
                {sellOrder.auto_price && (
                  <p className="text-xs text-gray-500">
                    The system will automatically set a competitive price based on current market conditions
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry">Listing Duration (hours)</Label>
                <Select
                  value={sellOrder.expiry_hours.toString()}
                  onValueChange={(value) => setSellOrder({ ...sellOrder, expiry_hours: Number.parseInt(value) })}
                >
                  <SelectTrigger id="expiry">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="72">72 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <p className="text-sm font-medium mb-2">Order Summary</p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm">
                    <span className="font-medium">Amount:</span> {sellOrder.amount.toFixed(2)} kWh
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Price:</span>{" "}
                    {sellOrder.auto_price ? "Auto-priced" : `$${sellOrder.price_per_kwh.toFixed(4)} per kWh`}
                  </p>
                  {!sellOrder.auto_price && (
                    <p className="text-sm">
                      <span className="font-medium">Total Value:</span> $
                      {(sellOrder.amount * sellOrder.price_per_kwh).toFixed(2)}
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Community:</span>{" "}
                    {communities.find((c) => c.id.toString() === selectedCommunity)?.name}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSellDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSellOrder} disabled={loading}>
                {loading ? "Creating..." : "Create Sell Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Trade Details Dialog */}
        <Dialog open={showTradeDetails} onOpenChange={setShowTradeDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Trade Details</DialogTitle>
            </DialogHeader>
            {tradeDetails && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Seller</p>
                    <p>{tradeDetails.seller_id === user.id ? "You" : `User #${tradeDetails.seller_id}`}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Listed</p>
                    <p>{new Date(tradeDetails.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p>{tradeDetails.amount.toFixed(2)} kWh</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Price</p>
                    <p>${tradeDetails.price_per_kwh.toFixed(4)} per kWh</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Value</p>
                    <p>${tradeDetails.total_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="capitalize">{tradeDetails.status}</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowTradeDetails(false)}>
                    Close
                  </Button>
                  {tradeDetails.seller_id === user.id ? (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleCancelTrade(tradeDetails.id)
                        setShowTradeDetails(false)
                      }}
                    >
                      Cancel Trade
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        handleBuyEnergy(tradeDetails.id)
                        setShowTradeDetails(false)
                      }}
                    >
                      Buy Energy
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default CommunityTrading

