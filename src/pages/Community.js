"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import { useToast } from "../hooks/use-toast"
import { useAuth } from "../contexts/AuthContext"
import api from "../config/axios"
import { FaUsers, FaExclamationTriangle, FaSolarPanel, FaBatteryFull, FaExchangeAlt } from "react-icons/fa"

const CommunityPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [community, setCommunity] = useState(null)
  const [communityMembers, setCommunityMembers] = useState([])
  const [communityStats, setCommunityStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchCommunityData()
    }
  }, [user])

  const fetchCommunityData = async () => {
    try {
      setLoading(true)
      // Get list of communities (should only be one default community)
      const communitiesResponse = await api.get("/community/list")
      const communities = communitiesResponse.data.communities

      if (communities.length > 0) {
        // Get the default community (first one)
        const defaultCommunity = communities[0]
        setCommunity(defaultCommunity)

        // Fetch community details
        const [membersResponse, statsResponse] = await Promise.all([
          api.get(`/community/${defaultCommunity.id}/members`),
          api.get(`/community/${defaultCommunity.id}/stats`),
        ])

        setCommunityMembers(membersResponse.data.members)
        setCommunityStats(statsResponse.data)
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching community data:", err)
      setError(err.response?.data?.msg || "Failed to fetch community data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Community Energy Sharing</h1>

      {error && (
        <Card className="bg-red-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <FaExclamationTriangle className="mr-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Community Info */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <FaUsers className="mr-2" />
                Community
              </CardTitle>
              <CardDescription>Your energy sharing community</CardDescription>
            </CardHeader>
            <CardContent>
              {community ? (
                <div className="space-y-4">
                  <div className="bg-teal-100 border-l-4 border-teal-600 p-4 rounded-md">
                    <h3 className="font-medium text-lg">{community.name}</h3>
                    <p className="text-sm text-gray-600">{community.description || "A community for energy sharing"}</p>
                    {community.location && <p className="text-xs text-gray-500 mt-1">{community.location}</p>}
                    <p className="text-sm mt-2">
                      <span className="font-medium">{community.member_count}</span> members
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(community.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>
                      You are automatically part of this community. All users can share and trade energy within this
                      community.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No community information available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Community Details */}
        <div className="md:col-span-2">
          {community ? (
            <Card>
              <CardHeader>
                <CardTitle>{community.name}</CardTitle>
                <CardDescription>{community.description || "A community for energy sharing"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="trades">Energy Trades</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-4">
                    {communityStats ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-4 rounded-md">
                            <div className="flex items-center text-teal-600 mb-2">
                              <FaUsers className="mr-2" />
                              <h3 className="font-medium">Members</h3>
                            </div>
                            <p className="text-2xl font-bold">{communityStats.member_count}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-md">
                            <div className="flex items-center text-teal-600 mb-2">
                              <FaSolarPanel className="mr-2" />
                              <h3 className="font-medium">Total Solar</h3>
                            </div>
                            <p className="text-2xl font-bold">{communityStats.total_solar_capacity.toFixed(2)} kW</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-md">
                            <div className="flex items-center text-teal-600 mb-2">
                              <FaBatteryFull className="mr-2" />
                              <h3 className="font-medium">Total Battery</h3>
                            </div>
                            <p className="text-2xl font-bold">{communityStats.total_battery_capacity.toFixed(2)} kWh</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="flex items-center text-teal-600 mb-2">
                            <FaExchangeAlt className="mr-2" />
                            <h3 className="font-medium">Energy Trading</h3>
                          </div>
                          <p className="text-lg font-bold mb-2">
                            Total Energy Traded: {communityStats.total_energy_traded.toFixed(2)} kWh
                          </p>
                          <Button
                            onClick={() => (window.location.href = `/trading?community=${community.id}`)}
                            className="mt-2"
                          >
                            Go to Trading Platform
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="members" className="mt-4">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2 text-left">Member</th>
                              <th className="px-4 py-2 text-left">Role</th>
                              <th className="px-4 py-2 text-left">Joined</th>
                            </tr>
                          </thead>
                          <tbody>
                            {communityMembers.map((member) => (
                              <tr key={member.id} className="border-b">
                                <td className="px-4 py-2">{member.full_name || member.username}</td>
                                <td className="px-4 py-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      member.role === "admin"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {member.role}
                                  </span>
                                </td>
                                <td className="px-4 py-2">{new Date(member.joined_at).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="trades" className="mt-4">
                    {communityStats && communityStats.recent_trades ? (
                      communityStats.recent_trades.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Seller</th>
                                <th className="px-4 py-2 text-left">Buyer</th>
                                <th className="px-4 py-2 text-left">Amount (kWh)</th>
                                <th className="px-4 py-2 text-left">Price ($/kWh)</th>
                                <th className="px-4 py-2 text-left">Total ($)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {communityStats.recent_trades.map((trade) => (
                                <tr key={trade.id} className="border-b">
                                  <td className="px-4 py-2">{new Date(trade.completed_at).toLocaleDateString()}</td>
                                  <td className="px-4 py-2">
                                    {communityMembers.find((m) => m.id === trade.seller_id)?.username || "Unknown"}
                                  </td>
                                  <td className="px-4 py-2">
                                    {communityMembers.find((m) => m.id === trade.buyer_id)?.username || "Unknown"}
                                  </td>
                                  <td className="px-4 py-2">{trade.amount.toFixed(2)}</td>
                                  <td className="px-4 py-2">${trade.price_per_kwh.toFixed(2)}</td>
                                  <td className="px-4 py-2">${trade.total_price.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No recent trades in this community</p>
                          <Button
                            onClick={() => (window.location.href = `/trading?community=${community.id}`)}
                            className="mt-4"
                          >
                            Start Trading
                          </Button>
                        </div>
                      )
                    ) : (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FaUsers className="text-gray-400 text-5xl mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">No Community Found</h3>
                <p className="text-gray-500 text-center mb-6">
                  There seems to be an issue with the community system. Please contact support.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommunityPage

