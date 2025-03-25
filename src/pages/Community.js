"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { useToast } from "../hooks/use-toast"
import { useAuth } from "../contexts/AuthContext"
import api from "../config/axios"
import { FaUsers, FaUserPlus, FaExclamationTriangle, FaSolarPanel, FaBatteryFull, FaExchangeAlt } from "react-icons/fa"

const CommunityPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [communities, setCommunities] = useState([])
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [communityMembers, setCommunityMembers] = useState([])
  const [communityStats, setCommunityStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    location: "",
  })

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    fetchCommunities()
  }, [user, navigate])

  const fetchCommunities = async () => {
    try {
      setLoading(true)
      const response = await api.get("/community/list")
      setCommunities(response.data.communities)
      setError(null)
    } catch (err) {
      console.error("Error fetching communities:", err)
      setError(err.response?.data?.msg || "Failed to fetch communities")
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunityDetails = async (communityId) => {
    try {
      setLoading(true)
      const [membersResponse, statsResponse] = await Promise.all([
        api.get(`/community/${communityId}/members`),
        api.get(`/community/${communityId}/stats`),
      ])

      setCommunityMembers(membersResponse.data.members)
      setCommunityStats(statsResponse.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching community details:", err)
      setError(err.response?.data?.msg || "Failed to fetch community details")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCommunity = async () => {
    try {
      setLoading(true)
      const response = await api.post("/community/create", newCommunity)

      toast({
        title: "Community Created",
        description: "Your community has been created successfully",
      })

      // Reset form and refresh communities
      setNewCommunity({
        name: "",
        description: "",
        location: "",
      })

      await fetchCommunities()
      setSelectedCommunity(response.data.community)
      await fetchCommunityDetails(response.data.community.id)

      setError(null)
    } catch (err) {
      console.error("Error creating community:", err)
      setError(err.response?.data?.msg || "Failed to create community")

      toast({
        title: "Error",
        description: err.response?.data?.msg || "Failed to create community",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCommunity = async (communityId) => {
    try {
      setLoading(true)
      await api.post(`/community/join/${communityId}`)

      toast({
        title: "Joined Community",
        description: "You have successfully joined the community",
      })

      await fetchCommunities()

      // If this is the currently selected community, refresh its details
      if (selectedCommunity && selectedCommunity.id === communityId) {
        await fetchCommunityDetails(communityId)
      }

      setError(null)
    } catch (err) {
      console.error("Error joining community:", err)
      setError(err.response?.data?.msg || "Failed to join community")

      toast({
        title: "Error",
        description: err.response?.data?.msg || "Failed to join community",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveCommunity = async (communityId) => {
    try {
      setLoading(true)
      await api.post(`/community/leave/${communityId}`)

      toast({
        title: "Left Community",
        description: "You have successfully left the community",
      })

      await fetchCommunities()

      // If this was the selected community, clear the selection
      if (selectedCommunity && selectedCommunity.id === communityId) {
        setSelectedCommunity(null)
        setCommunityMembers([])
        setCommunityStats(null)
      }

      setError(null)
    } catch (err) {
      console.error("Error leaving community:", err)
      setError(err.response?.data?.msg || "Failed to leave community")

      toast({
        title: "Error",
        description: err.response?.data?.msg || "Failed to leave community",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectCommunity = async (community) => {
    setSelectedCommunity(community)
    await fetchCommunityDetails(community.id)
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
        {/* Communities List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <FaUsers className="mr-2" />
                  Communities
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center">
                      <FaUserPlus className="mr-2" />
                      Create
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Community</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="community-name">Community Name</Label>
                        <Input
                          id="community-name"
                          value={newCommunity.name}
                          onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                          placeholder="Enter community name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="community-description">Description</Label>
                        <Input
                          id="community-description"
                          value={newCommunity.description}
                          onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                          placeholder="Enter community description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="community-location">Location</Label>
                        <Input
                          id="community-location"
                          value={newCommunity.location}
                          onChange={(e) => setNewCommunity({ ...newCommunity, location: e.target.value })}
                          placeholder="Enter community location"
                        />
                      </div>
                      <Button onClick={handleCreateCommunity} disabled={loading} className="w-full">
                        {loading ? "Creating..." : "Create Community"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>Join or create energy sharing communities</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && communities.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : communities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No communities found</p>
                  <p className="text-sm">Create a new community to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {communities.map((community) => (
                    <div
                      key={community.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedCommunity && selectedCommunity.id === community.id
                          ? "bg-teal-100 border-l-4 border-teal-600"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => selectCommunity(community)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{community.name}</h3>
                        {community.is_member ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLeaveCommunity(community.id)
                            }}
                          >
                            Leave
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleJoinCommunity(community.id)
                            }}
                          >
                            Join
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{community.member_count} members</p>
                      {community.location && <p className="text-xs text-gray-400">{community.location}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Community Details */}
        <div className="md:col-span-2">
          {selectedCommunity ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedCommunity.name}</CardTitle>
                <CardDescription>{selectedCommunity.description}</CardDescription>
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
                            onClick={() => navigate(`/trading?community=${selectedCommunity.id}`)}
                            className="mt-2"
                          >
                            Go to Trading Platform
                          </Button>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Community Information</h3>
                          <p className="text-sm">
                            <strong>Location:</strong> {selectedCommunity.location || "Not specified"}
                          </p>
                          <p className="text-sm">
                            <strong>Created:</strong> {new Date(selectedCommunity.created_at).toLocaleDateString()}
                          </p>
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
                            onClick={() => navigate(`/trading?community=${selectedCommunity.id}`)}
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
                <h3 className="text-xl font-medium text-gray-600 mb-2">Select a Community</h3>
                <p className="text-gray-500 text-center mb-6">
                  Choose a community from the list or create a new one to view details
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Create New Community</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Community</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="community-name-modal">Community Name</Label>
                        <Input
                          id="community-name-modal"
                          value={newCommunity.name}
                          onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                          placeholder="Enter community name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="community-description-modal">Description</Label>
                        <Input
                          id="community-description-modal"
                          value={newCommunity.description}
                          onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                          placeholder="Enter community description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="community-location-modal">Location</Label>
                        <Input
                          id="community-location-modal"
                          value={newCommunity.location}
                          onChange={(e) => setNewCommunity({ ...newCommunity, location: e.target.value })}
                          placeholder="Enter community location"
                        />
                      </div>
                      <Button onClick={handleCreateCommunity} disabled={loading} className="w-full">
                        {loading ? "Creating..." : "Create Community"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommunityPage

