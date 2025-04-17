import api from './api';

const applianceService = {
  getAppliances: async (householdId = null) => {
    const params = householdId ? { household_id: householdId } : {};
    return api.get('/appliance', { params });
  },
  
  getAppliance: async (applianceId) => {
    return api.get(`/appliance/${applianceId}`);
  },
  
  createAppliance: async (applianceData) => {
    return api.post('/appliance', applianceData);
  },
  
  updateAppliance: async (applianceId, applianceData) => {
    return api.put(`/appliance/${applianceId}`, applianceData);
  },
  
  deleteAppliance: async (applianceId) => {
    return api.delete(`/appliance/${applianceId}`);
  },
  
  updateApplianceStatus: async (applianceId, status) => {
    return api.put(`/appliance/${applianceId}/status`, { status });
  },
  
  updateApplianceSchedule: async (applianceId, schedule) => {
    return api.put(`/appliance/${applianceId}/schedule`, { schedule });
  }
};

export default applianceService;