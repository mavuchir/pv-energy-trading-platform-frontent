import api from './api';

const energyService = {
  // Dashboard data
  getDashboardData: async () => {
    return api.get('/energy/dashboard');
  },
  
  // Energy production
  getEnergyProduction: async (params = {}) => {
    return api.get('/energy/production', { params });
  },
  
  recordEnergyProduction: async (data) => {
    return api.post('/energy/production', data);
  },
  
  // Energy consumption
  getEnergyConsumption: async (params = {}) => {
    return api.get('/energy/consumption', { params });
  },
  
  recordEnergyConsumption: async (data) => {
    return api.post('/energy/consumption', data);
  },
  
  // Battery status
  getBatteryStatus: async (params = {}) => {
    return api.get('/energy/battery', { params });
  },
  
  updateBatteryStatus: async (data) => {
    return api.post('/energy/battery', data);
  },
  
  // ML predictions
  getDemandPrediction: async (hours = 24) => {
    return api.get('/ml/predict/demand', { params: { hours } });
  },
  
  getProductionPrediction: async (hours = 24) => {
    return api.get('/ml/predict/production', { params: { hours } });
  },
  
  getEnergyBalance: async (hours = 24) => {
    return api.get('/ml/balance', { params: { hours } });
  },
  
  getRecommendations: async () => {
    return api.get('/ml/recommendations');
  },
  
  trainDemandModel: async (days = 30) => {
    return api.post('/ml/train/demand', { days });
  },
  
  trainProductionModel: async (days = 30) => {
    return api.post('/ml/train/production', { days });
  }
};

export default energyService;