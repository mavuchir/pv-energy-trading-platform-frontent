"use client"

import { useState, useEffect } from "react"
import {
  FaUsers,
  FaExchangeAlt,
  FaChartLine,
  FaSync,
  FaExclamationTriangle,
  FaUserPlus,
  FaSignOutAlt,
  FaInfoCircle,
} from "react-icons/fa"
import CommunityService from "../services/CommunityService"
import TradeService from "../services/TradeService"

const Community = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [communityData, setCommunityData] = useState(null)
  const [communities, setCommunities] = useState([])
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [trades, setTrades] = useState([])
  const [members, setMembers] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  useEffect(() => {
    fetchCommunities()
  }, [])

  useEffect(() => {
    if (selectedCommunity) {
      fetchCommunityData()
    }
  }, [selectedCommunity, selectedPeriod])

  const fetchCommunities = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await CommunityService.getCommunityData()
      setCommunities(response.communities || [])

      if (response.communities && response.communities.length > 0) {
        setSelectedCommunity(response.communities[0].id)
      }
    } catch (err) {
      console.error("Error fetching communities:", err)
      setError("Failed to fetch community data")
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunityData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get community details
      const communityDetails = await CommunityService.getCommunityStatistics(selectedPeriod)
      setCommunityData(communityDetails)

      // Get community members
      const membersData = await CommunityService.getCommunityMembers()
      setMembers(membersData.members || [])

      // Get community trades
      const tradesData = await TradeService.getCommunityTrades(selectedCommunity, selectedPeriod)
      setTrades(tradesData.trades || [])

      // Get statistics
      setStatistics(
        communityDetails.statistics || {
          total_members: 0,
          active_members: 0,
          total_trades: 0,
          total_energy: 0,
          total_value: 0,
        },
      )
    } catch (err) {
      console.error("Error fetching community data:", err)
      setError("Failed to fetch community data")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchCommunityData()
  }

  const handleJoinCommunity = async (communityId) => {
    try {
      await CommunityService.joinCommunity(communityId)
      fetchCommunities()
    } catch (err) {
      console.error("Error joining community:", err)
      setError("Failed to join community")
    }
  }

  const handleLeaveCommunity = async (communityId) => {
    try {
      await CommunityService.leaveCommunity(communityId)
      fetchCommunities()
    } catch (err) {
      console.error("Error leaving community:", err)
      setError("Failed to leave community")
    }
  }

  if (loading && !communities.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Community Energy Sharing</h1>

        <div className="flex flex-wrap items-center space-x-4">
          <select
            value={selectedCommunity || ""}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            disabled={!communities.length}
          >
            {communities.length ? (
              communities.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.name}
                </option>
              ))
            ) : (
              <option value="">No communities available</option>
            )}
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            disabled={!selectedCommunity}
          >
            <FaSync className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!communities.length ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <FaUsers className="mx-auto text-4xl text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Communities Found</h2>
          <p className="text-gray-500 mb-6">
            There seems to be an issue with the community system. Please contact support.
          </p>
        </div>
      ) : (
        <>
          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <FaUsers className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Members</p>
                  <p className="text-2xl font-semibold">{statistics?.total_members || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 mr-4">
                  <FaUsers className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Members</p>
                  <p className="text-2xl font-semibold">{statistics?.active_members || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 mr-4">
                  <FaExchangeAlt className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Trades</p>
                  <p className="text-2xl font-semibold">{statistics?.total_trades || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 mr-4">
                  <FaChartLine className="text-yellow-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Energy Traded</p>
                  <p className="text-2xl font-semibold">{statistics?.total_energy?.toFixed(1) || 0} kWh</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-teal-100 mr-4">
                  <FaChartLine className="text-teal-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-2xl font-semibold">${statistics?.total_value?.toFixed(2) || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Community Info */}
            <div className="bg-white rounded-lg shadow-sm lg:col-span-1">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Community Information</h2>
              </div>
              <div className="p-4">
                {communityData ? (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{communityData.name}</h3>
                    <p className="text-gray-600 mb-4">{communityData.description || "No description available"}</p>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{communityData.location || "Not specified"}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">
                        {communityData.created_at ? new Date(communityData.created_at).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Your Role</p>
                      <p className="font-medium capitalize">{communityData.your_role || "Member"}</p>
                    </div>

                    <div className="flex space-x-2 mt-6">
                      {communityData.is_member ? (
                        <button
                          onClick={() => handleLeaveCommunity(selectedCommunity)}
                          className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                        >
                          <FaSignOutAlt className="mr-2" />
                          Leave Community
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinCommunity(selectedCommunity)}
                          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                          <FaUserPlus className="mr-2" />
                          Join Community
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaInfoCircle className="mx-auto text-4xl text-gray-300 mb-2" />
                    <p className="text-gray-500">Select a community to view details</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-white rounded-lg shadow-sm lg:col-span-2">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Recent Trades</h2>
              </div>
              <div className="p-4">
                {trades.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Seller
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Buyer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {trades.map((trade) => (
                          <tr key={trade.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(trade.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {trade.seller?.username || "Unknown"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {trade.buyer?.username || "Unknown"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.amount} kWh</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${trade.price}/kWh</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  trade.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : trade.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {trade.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaExchangeAlt className="mx-auto text-4xl text-gray-300 mb-2" />
                    <p className="text-gray-500">No trades found for this community</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Community Members</h2>
            </div>
            <div className="p-4">
              {members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member) => (
                    <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold mr-3">
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-md font-semibold">{member.full_name || member.username}</h3>
                          <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Joined: {new Date(member.joined_at).toLocaleDateString()}</p>
                        {member.energy_contributed && (
                          <p>Energy Contributed: {member.energy_contributed.toFixed(1)} kWh</p>
                        )}
                        {member.energy_consumed && <p>Energy Consumed: {member.energy_consumed.toFixed(1)} kWh</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaUsers className="mx-auto text-4xl text-gray-300 mb-2" />
                  <p className="text-gray-500">No members found for this community</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Community
