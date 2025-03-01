"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Button } from "../ui/button"
import { toast } from "../ui/use-toast"
import axios from "axios"

const TradeRecommendation = () => {
  const [recommendation, setRecommendation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTradeRecommendation()
  }, [])

  const fetchTradeRecommendation = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/energy/trade-recommendation", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setRecommendation(response.data)
      setIsLoading(false)
    } catch (err) {
      console.error("Error fetching trade recommendation:", err)
      setError("Failed to load trade recommendation")
      setIsLoading(false)
    }
  }

  const handleTrade = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/energy/execute-trade",
        { action: recommendation.action, amount: recommendation.amount },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
      )
      toast({
        title: "Trade Executed",
        description: `Successfully ${recommendation.action} ${recommendation.amount} kWh of energy.`,
      })
      fetchTradeRecommendation() // Refresh recommendation after trade
    } catch (err) {
      console.error("Error executing trade:", err)
      toast({
        title: "Error",
        description: "Failed to execute trade. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) return <div>Loading trade recommendation...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Recommendation</CardTitle>
      </CardHeader>
      <CardContent>
        {recommendation ? (
          <div className="space-y-4">
            <p>Recommended Action: {recommendation.action}</p>
            <p>Amount: {recommendation.amount} kWh</p>
            <p>Reason: {recommendation.reason}</p>
            <Button onClick={handleTrade}>Execute Trade</Button>
          </div>
        ) : (
          <p>No trade recommendations at this time.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default TradeRecommendation

