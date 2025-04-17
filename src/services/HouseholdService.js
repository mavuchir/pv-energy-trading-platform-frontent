import api from './api';

const householdService = {
  getHouseholds: async () => {
    return api.get('/household');
  },
  
  getHousehold: async (householdId) => {
    return api.get(`/household/${householdId}`);
  },
  
  createHousehold: async (householdData) => {
    return api.post('/household', householdData);
  },
  
  updateHousehold: async (householdId, householdData) => {
    return api.put(`/household/${householdId}`, householdData);
  },
  
  deleteHousehold: async (householdId) => {
    return api.delete(`/household/${householdId}`);
  },
  
  getPrimaryHousehold: async () => {
    return api.get('/household/primary');
  }
};

export default householdService;