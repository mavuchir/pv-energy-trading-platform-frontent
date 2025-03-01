import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const energyService = {
    getOverview: () => api.get('/energy/overview'),
    getRealTimeData: () => api.get('/energy/real-time'),
    getSimulationData: () => api.get('/energy/simulation/data'),
    toggleAppliance: (id) => api.post('/energy/appliances/toggle', { id }),
    saveConfiguration: (config) => api.post('/energy/configuration', config),
    getConfiguration: () => api.get('/energy/configuration')
};

export default api;