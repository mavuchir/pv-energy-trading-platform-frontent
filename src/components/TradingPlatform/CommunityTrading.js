"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "../../hooks/use-toast"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../config/axios"
import { FaExclamationTriangle, FaUsers } from "react-icons/fa"

const CommunityTrading = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [communities, setCommunities] = useState([])
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [communityTrades, setCommunityTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUserCommunities()
  }, [])

  useEffect(() => {
    if (selectedCommunity) {
      fetchCommunityTrades(selectedCommunity)
    }
  }, [selectedCommunity])

  const fetchUserCommunities = async () => {
    try {
      setLoading(true)
      const response = await api.get("/community/list")

      // Filter to only include communities the user is a member of
      const userCommunities = response.data.communities.filter((community) => community.is_member)
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
      const response = await api.get(`/trade/market-data?community_id=${communityId}`)
      setCommunityTrades(response.data.active_trades || [])
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
      await api.post(`/trade/buy/${tradeId}`)

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
      await api.post(`/trade/cancel/${tradeId}`)

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FaUsers className="mr-2" />
          Community Energy Trading
        </CardTitle>
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
            <div className="mb-6">
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

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : communityTrades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No active trades in this community</p>
                <p className="text-sm mt-2">Be the first to list your excess energy for sale!</p>
                <Button
                  onClick={() => (window.location.href = "/trading?action=sell&community=" + selectedCommunity)}
                  className="mt-4"
                >
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
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {communityTrades.map((trade) => (
                      <tr key={trade.id} className="border-b">
                        <td className="px-4 py-2">
                          {trade.seller_id === user.id ? "You" : `User #${trade.seller_id}`}
                        </td>
                        <td className="px-4 py-2">{trade.amount.toFixed(2)}</td>
                        <td className="px-4 py-2">${trade.price_per_kwh.toFixed(2)}</td>
                        <td className="px-4 py-2">${trade.total_price.toFixed(2)}</td>
                        <td className="px-4 py-2">{new Date(trade.created_at).toLocaleString()}</td>
                        <td className="px-4 py-2">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default CommunityTrading

