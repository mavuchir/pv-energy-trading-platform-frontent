import api from "./api"

const CommunityService = {
  // List communities
  listCommunities: async () => {
    try {
      const response = await api.get("/community/list")
      return { success: true, communities: response.data.communities }
    } catch (error) {
      console.error("Error listing communities:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to list communities" }
    }
  },

  // Get community members
  getCommunityMembers: async (communityId) => {
    try {
      const response = await api.get(`/community/${communityId}/members`)
      return { success: true, members: response.data.members }
    } catch (error) {
      console.error("Error getting community members:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to get community members" }
    }
  },

  // Get community stats
  getCommunityStats: async (communityId) => {
    try {
      const response = await api.get(`/community/${communityId}/stats`)
      return { success: true, stats: response.data }
    } catch (error) {
      console.error("Error getting community stats:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to get community stats" }
    }
  },

  // Get community energy forecast
  getCommunityEnergyForecast: async (communityId) => {
    try {
      const response = await api.get(`/community/${communityId}/energy-forecast`)
      return { success: true, forecast: response.data }
    } catch (error) {
      console.error("Error getting community energy forecast:", error)
      return { success: false, error: error.response?.data?.msg || "Failed to get community energy forecast" }
    }
  },
}

export default CommunityService

