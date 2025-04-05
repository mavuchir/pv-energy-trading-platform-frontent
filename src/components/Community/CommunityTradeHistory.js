"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { FaExchangeAlt, FaArrowRight, FaFilter, FaCalendarAlt, FaChartLine } from "react-icons/fa"

const CommunityTradeHistory = ({ trades = [], members = [], communityId, onRefresh }) => {
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const getFilteredTrades = () => {
    let filtered = [...trades]

    // Apply filter
    if (filter === "selling") {
      filtered = filtered.filter((trade) => trade.type === "sell" || trade.seller_id)
    } else if (filter === "buying") {
      filtered = filtered.filter((trade) => trade.type === "buy" || trade.buyer_id)
    } else if (filter === "completed") {
      filtered = filtered.filter((trade) => trade.status === "completed")
    } else if (filter === "pending") {
      filtered = filtered.filter((trade) => trade.status === "pending")
    }

    // Apply sorting
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sortBy === "amount") {
      filtered.sort((a, b) => b.amount - a.amount)
    } else if (sortBy === "price") {
      filtered.sort((a, b) => b.price - a.price)
    }

    return filtered
  }

  const getMemberName = (id) => {
    const member = members.find((m) => m.id === id)
    return member ? member.username || member.email : "Unknown User"
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  const filteredTrades = getFilteredTrades()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-medium">Energy Trade History</h3>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-3 py-1 border rounded-md text-sm"
            >
              <option value="all">All Trades</option>
              <option value="selling">Selling</option>
              <option value="buying">Buying</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="relative">
            <FaChartLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-10 pr-3 py-1 border rounded-md text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="amount">Highest Amount</option>
              <option value="price">Highest Price</option>
            </select>
          </div>
          <Button size="sm" variant="outline" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      {filteredTrades.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FaExchangeAlt className="text-gray-400 text-4xl mb-3" />
            <p className="text-gray-500">No energy trades found</p>
            <Button className="mt-4" onClick={() => (window.location.href = `/trading?communityId=${communityId}`)}>
              Go to Trading Platform
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTrades.map((trade) => (
            <Card key={trade.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                        <FaExchangeAlt />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">
                          {trade.seller_id ? getMemberName(trade.seller_id) : trade.seller_name}
                          <FaArrowRight className="inline mx-2" />
                          {trade.buyer_id ? getMemberName(trade.buyer_id) : trade.buyer_name}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FaCalendarAlt className="mr-1" />
                          <span>{new Date(trade.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-teal-700">{trade.amount.toFixed(2)} kWh</p>
                      <p className="text-sm text-gray-600">${trade.price.toFixed(2)}</p>
                    </div>
                    {getStatusBadge(trade.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default CommunityTradeHistory

