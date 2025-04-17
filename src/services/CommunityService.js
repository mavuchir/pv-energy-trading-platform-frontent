import api from './api';

const communityService = {
  getCommunities: async (memberOnly = false) => {
    return api.get('/community', { params: { member_only: memberOnly } });
  },
  
  getCommunity: async (communityId) => {
    return api.get(`/community/${communityId}`);
  },
  
  createCommunity: async (communityData) => {
    return api.post('/community', communityData);
  },
  
  updateCommunity: async (communityId, communityData) => {
    return api.put(`/community/${communityId}`, communityData);
  },
  
  getCommunityMembers: async (communityId) => {
    return api.get(`/community/${communityId}/members`);
  },
  
  joinCommunity: async (communityId) => {
    return api.post(`/community/${communityId}/join`);
  },
  
  leaveCommunity: async (communityId) => {
    return api.post(`/community/${communityId}/leave`);
  },
  
  updateMemberRole: async (communityId, userId, role) => {
    return api.put(`/community/${communityId}/members/${userId}/role`, { role });
  },
  
  removeMember: async (communityId, userId) => {
    return api.delete(`/community/${communityId}/members/${userId}`);
  },
  
  getCommunityTrades: async (communityId, params = {}) => {
    return api.get(`/community/${communityId}/trades`, { params });
  },
  
  getCommunityDashboard: async (communityId) => {
    return api.get(`/community/${communityId}/dashboard`);
  }
};

export default communityService;