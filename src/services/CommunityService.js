import api from "./api"

const communityService = {
  // Get all communities
  getCommunities: async () => {
    try {
      const response = await api.get("/communities")
      return { success: true, communities: response.data.communities || [] }
    } catch (error) {
      console.error("Error fetching communities:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch communities",
      }
    }
  },

  // Get a single community
  getCommunity: async (id) => {
    try {
      const response = await api.get(`/communities/${id}`)
      return { success: true, community: response.data }
    } catch (error) {
      console.error(`Error fetching community ${id}:`, error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch community",
      }
    }
  },

  // Create a new community
  createCommunity: async (communityData) => {
    try {
      const response = await api.post("/communities", communityData)
      return { success: true, community: response.data.community }
    } catch (error) {
      console.error("Error creating community:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to create community",
      }
    }
  },

  // Update a community
  updateCommunity: async (id, communityData) => {
    try {
      const response = await api.put(`/communities/${id}`, communityData)
      return { success: true, community: response.data.community }
    } catch (error) {
      console.error(`Error updating community ${id}:`, error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to update community",
      }
    }
  },

  // Delete a community
  deleteCommunity: async (id) => {
    try {
      const response = await api.delete(`/communities/${id}`)
      return { success: true, message: response.data.msg }
    } catch (error) {
      console.error(`Error deleting community ${id}:`, error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to delete community",
      }
    }
  },

  // Join a community
  joinCommunity: async (id) => {
    try {
      const response = await api.post(`/communities/${id}/join`, {})
      return { success: true, membership: response.data.membership }
    } catch (error) {
      console.error(`Error joining community ${id}:`, error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to join community",
      }
    }
  },

  // Leave a community
  leaveCommunity: async (id) => {
    try {
      const response = await api.post(`/communities/${id}/leave`, {})
      return { success: true, message: response.data.msg }
    } catch (error) {
      console.error(`Error leaving community ${id}:`, error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to leave community",
      }
    }
  },

  // Get community members
  getCommunityMembers: async (id) => {
    try {
      const response = await api.get(`/communities/${id}/members`)
      return { success: true, members: response.data.members || [] }
    } catch (error) {
      console.error(`Error fetching members for community ${id}:`, error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch community members",
      }
    }
  },

  // Get user's communities
  getUserCommunities: async () => {
    try {
      const response = await api.get("/communities/user")
      return { success: true, communities: response.data.communities || [] }
    } catch (error) {
      console.error("Error fetching user communities:", error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch user communities",
      }
    }
  },

  // Get community energy statistics
  getCommunityStats: async (id) => {
    try {
      const response = await api.get(`/communities/${id}/stats`)
      return { success: true, stats: response.data }
    } catch (error) {
      console.error(`Error fetching statistics for community ${id}:`, error)
      return {
        success: false,
        error: error.response?.data?.msg || "Failed to fetch community statistics",
      }
    }
  },
}

export default communityService
