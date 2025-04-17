import api from './api';

const simulationService = {
  getSimulationStatus: async () => {
    return api.get('/simulation/status');
  },
  
  toggleSimulation: async (isEnabled) => {
    return api.put('/simulation/toggle', { is_enabled: isEnabled });
  },
  
  updateGenerationSettings: async (settings) => {
    return api.put('/simulation/generation', settings);
  },
  
  updatePredictionSettings: async (settings) => {
    return api.put('/simulation/prediction', settings);
  },
  
  updatePricingSettings: async (settings) => {
    return api.put('/simulation/pricing', settings);
  },
  
  updateWeatherSimulation: async (weatherData) => {
    return api.put('/simulation/weather', weatherData);
  },
  
  runSimulation: async () => {
    return api.post('/simulation/run');
  },
  
  runScenario: async (scenario) => {
    return api.post('/simulation/scenario', { scenario });
  }
};

export default simulationService;