import api from './api';

const weatherService = {
  getCurrentWeather: async (params = {}) => {
    return api.get('/weather/current', { params });
  },
  
  getWeatherForecast: async (params = {}) => {
    return api.get('/weather/forecast', { params });
  },
  
  getHourlyForecast: async (params = {}) => {
    return api.get('/weather/hourly', { params });
  },
  
  getWeatherHistory: async (params = {}) => {
    return api.get('/weather/history', { params });
  }
};

export default weatherService;