import api from "./api"

class CommunityService {
  // Get community summary
  static async getCommunityData() {
    try {
      const response = await api.get("/community/summary")
      return response.data
    } catch (error) {
      console.error("Get community data error:", error)
      return { name: "N/A", members: 0, energy_shared: 0 }
    }
  }

  // Get community members
  static async getCommunityMembers() {
    try {
      const response = await api.get("/community/members")
      return response.data
    } catch (error) {
      console.error("Get community members error:", error)
      return { members: [] }
    }
  }

  // Get community energy statistics
  static async getCommunityStatistics(period = "month") {
    try {
      const response = await api.get(`/community/statistics?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Get community statistics error:", error)
      return { statistics: {} }
    }
  }

  // Get community events
  static async getCommunityEvents() {
    try {
      const response = await api.get("/community/events")
      return response.data
    } catch (error) {
      console.error("Get community events error:", error)
      return { events: [] }
    }
  }

  // Create community post
  static async createPost(postData) {
    try {
      const response = await api.post("/community/posts", postData)
      return response.data
    } catch (error) {
      console.error("Create post error:", error)
      throw error
    }
  }

  // Get community posts
  static async getPosts() {
    try {
      const response = await api.get("/community/posts")
      return response.data
    } catch (error) {
      console.error("Get posts error:", error)
      return { posts: [] }
    }
  }

  // Comment on post
  static async commentOnPost(postId, commentData) {
    try {
      const response = await api.post(`/community/posts/${postId}/comments`, commentData)
      return response.data
    } catch (error) {
      console.error("Comment on post error:", error)
      throw error
    }
  }

  // Get community leaderboard
  static async getLeaderboard(period = "month") {
    try {
      const response = await api.get(`/community/leaderboard?period=${period}`)
      return response.data
    } catch (error) {
      console.error("Get leaderboard error:", error)
      return { leaderboard: [] }
    }
  }

  // Join community event
  static async joinEvent(eventId) {
    try {
      const response = await api.post(`/community/events/${eventId}/join`, {})
      return response.data
    } catch (error) {
      console.error("Join event error:", error)
      throw error
    }
  }
}

export default CommunityService
