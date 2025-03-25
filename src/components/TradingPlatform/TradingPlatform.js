"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card"
import MarketOverview from "./MarketOverview"
import EnergyTrading from "./EnergyTrading"
import CommunityTrading from "./CommunityTrading"
import { useAuth } from "../../contexts/AuthContext"

const TradingPlatform = ({ marketData }) => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState("market")

  useEffect(() => {
    // Check URL parameters for initial tab selection
    const tab = searchParams.get("tab")
    if (tab && ["market", "trade", "community"].includes(tab)) {
      setActiveTab(tab)
    }

    // Check if community parameter is present
    const community = searchParams.get("community")
    if (community) {
      setActiveTab("community")
    }

    // Check if action parameter is present
    const action = searchParams.get("action")
    if (action === "sell" || action === "buy") {
      setActiveTab("trade")
    }
  }, [searchParams])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Energy Trading Platform</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="market">Market Overview</TabsTrigger>
          <TabsTrigger value="trade">Trade Energy</TabsTrigger>
          <TabsTrigger value="community">Community Trading</TabsTrigger>
        </TabsList>

        <TabsContent value="market">
          <MarketOverview />
        </TabsContent>

        <TabsContent value="trade">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Trade Energy</CardTitle>
                </CardHeader>
                <CardContent>
                  <EnergyTrading
                    onTradeComplete={() => setActiveTab("market")}
                    initialTradeType={searchParams.get("action") || "sell"}
                    communityId={searchParams.get("community")}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${user?.account_balance?.toFixed(2) || "0.00"}</div>
                  <p className="text-sm text-gray-500 mt-2">
                    Your current balance for energy trading. This balance increases when you sell energy and decreases
                    when you buy energy.
                  </p>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Trading Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Sell excess energy during peak production hours (10 AM - 2 PM)</li>
                    <li>Buy energy when your production is low (evening and night)</li>
                    <li>Check market prices regularly as they fluctuate based on supply and demand</li>
                    <li>Community trading often offers better prices than the open market</li>
                    <li>Consider battery storage to buy energy when prices are low and sell when high</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="community">
          <CommunityTrading />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TradingPlatform

