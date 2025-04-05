"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"
import {
  FaExclamationTriangle,
  FaUsers,
  FaSolarPanel,
  FaBatteryFull,
  FaExchangeAlt,
  FaLightbulb,
  FaChartLine,
} from "react-icons/fa"
import CommunityService from "../services/community"

const Community = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [community, setCommunity] = useState(null)
  const [communityMembers, setCommunityMembers] = useState([])
  const [communityStats, setCommunityStats] = useState(null)
  const [communityForecasts, setCommunityForecasts] = useState([])
  const [activeTab, setActiveTab] = useState("overview")
  const { user } = useAuth()

  useEffect(() => {
    fetchCommunityData()
  }, [])

  const fetchCommunityData = async () => {
    try {
      setLoading(true)
      // Get list of communities (should only be one default community)
      const communitiesResponse = await CommunityService.listCommunities()

      if (
        communitiesResponse.success &&
        communitiesResponse.communities &&
        communitiesResponse.communities.length > 0
      ) {
        // Get the default community (first one)
        const defaultCommunity = communitiesResponse.communities[0]
        setCommunity(defaultCommunity)

        // Fetch community details
        const [membersResponse, statsResponse, forecastResponse] = await Promise.all([
          CommunityService.getCommunityMembers(defaultCommunity.id),
          CommunityService.getCommunityStats(defaultCommunity.id),
          CommunityService.getCommunityEnergyForecast(defaultCommunity.id),
        ])

        if (membersResponse.success) {
          setCommunityMembers(Array.isArray(membersResponse.members) ? membersResponse.members : [])
        } else {
          setCommunityMembers([])
        }

        if (statsResponse.success) {
          setCommunityStats(statsResponse.stats)
        }

        if (forecastResponse.success) {
          setCommunityForecasts(
            Array.isArray(forecastResponse.forecast?.forecast) ? forecastResponse.forecast.forecast : [],
          )
        } else {
          setCommunityForecasts([])
        }
      } else {
        setError("No community found. Please contact support.")
      }
    } catch (err) {
      console.error("Error fetching community data:", err)
      setError(err.response?.data?.msg || "Failed to fetch community data")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !community) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-600">Community Energy Sharing</h1>
          <p className="text-gray-600">Connect and trade with your local energy community</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button
            onClick={fetchCommunityData}
            className={`bg-teal-600 hover:bg-teal-700 ${loading ? "opacity-70" : ""}`}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
      </div>

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

          {communityStats && (
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <FaChartLine className="mr-2" />
                  Community Stats
                </CardTitle>
                <CardDescription>Overall community energy statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
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
                    <p className="text-2xl font-bold">{communityStats.total_solar_capacity?.toFixed(2) || 0} kW</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center text-teal-600 mb-2">
                      <FaBatteryFull className="mr-2" />
                      <h3 className="font-medium">Total Battery</h3>
                    </div>
                    <p className="text-2xl font-bold">{communityStats.total_battery_capacity?.toFixed(2) || 0} kWh</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center text-teal-600 mb-2">
                      <FaExchangeAlt className="mr-2" />
                      <h3 className="font-medium">Energy Traded</h3>
                    </div>
                    <p className="text-2xl font-bold">{communityStats.total_energy_traded?.toFixed(2) || 0} kWh</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="forecast">Energy Forecast</TabsTrigger>
                    <TabsTrigger value="trades">Energy Trades</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-4">
                    {communityStats ? (
                      <>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="flex items-center text-teal-600 mb-4">
                            <FaLightbulb className="mr-2" />
                            <h3 className="font-medium">Community Energy Overview</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            Shared energy within the community allows all members to benefit from reduced grid
                            dependency and lower costs.
                          </p>
                          <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={communityForecasts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value} kWh`, ""]} />
                                <Legend />
                                <Area
                                  type="monotone"
                                  dataKey="estimated_generation"
                                  stackId="1"
                                  name="Generation"
                                  stroke="#4FD1C5"
                                  fill="#4FD1C5"
                                  fillOpacity={0.6}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="estimated_demand"
                                  stackId="2"
                                  name="Demand"
                                  stroke="#FC8181"
                                  fill="#FC8181"
                                  fillOpacity={0.6}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="flex items-center text-teal-600 mb-2">
                            <FaExchangeAlt className="mr-2" />
                            <h3 className="font-medium">Energy Trading</h3>
                          </div>
                          <p className="text-lg font-bold mb-2">
                            Total Energy Traded: {communityStats.total_energy_traded?.toFixed(2) || 0} kWh
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
                              <th className="px-4 py-2 text-left">Solar Capacity</th>
                              <th className="px-4 py-2 text-left">Battery Capacity</th>
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
                                <td className="px-4 py-2">{member.solar_capacity || 0} kW</td>
                                <td className="px-4 py-2">{member.battery_capacity || 0} kWh</td>
                                <td className="px-4 py-2">{new Date(member.joined_at).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="forecast" className="mt-4">
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="font-medium text-teal-700 mb-3">24-Hour Energy Forecast</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          This forecast shows the predicted energy generation and demand for the community over the next
                          24 hours.
                        </p>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={communityForecasts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                              <YAxis label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft" }} />
                              <Tooltip formatter={(value) => [`${value} kWh`, ""]} />
                              <Legend />
                              <Bar
                                dataKey="net_energy"
                                name="Net Energy"
                                fill={communityForecasts?.some((f) => f.net_energy < 0) ? "#68D391" : "#F56565"}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Positive values indicate excess energy available for export, negative values indicate energy
                          deficit requiring import.
                        </p>
                      </div>

                      {communityStats && communityStats.energy_forecast && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-medium text-blue-700 mb-2">Peak Generation</h3>
                            <p className="text-lg font-bold">{communityStats.peak_generation_time || "12:00 PM"}</p>
                            <p className="text-sm text-gray-600">
                              {communityStats.peak_generation_value?.toFixed(2) || "N/A"} kWh
                            </p>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg">
                            <h3 className="font-medium text-red-700 mb-2">Peak Demand</h3>
                            <p className="text-lg font-bold">{communityStats.peak_demand_time || "7:00 PM"}</p>
                            <p className="text-sm text-gray-600">
                              {communityStats.peak_demand_value?.toFixed(2) || "N/A"} kWh
                            </p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-medium text-green-700 mb-2">Self-Sufficiency</h3>
                            <p className="text-lg font-bold">
                              {communityStats.self_sufficiency_rate?.toFixed(1) || "N/A"}%
                            </p>
                            <p className="text-sm text-gray-600">Percentage of demand met by community generation</p>
                          </div>
                        </div>
                      )}
                    </div>
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

export default Community

