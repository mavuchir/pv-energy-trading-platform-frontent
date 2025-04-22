import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

const predictionService = {
  // Get energy consumption prediction
  getPrediction: async (userId, timeRange = 'day') => {
    try {
      const response = await axios.get(`${API_URL}/predictions/consumption`, {
        params: { user_id: userId, time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching consumption prediction:', error);
      throw error;
    }
  },

  // Get energy production prediction
  getProductionPrediction: async (userId, timeRange = 'day') => {
    try {
      const response = await axios.get(`${API_URL}/predictions/production`, {
        params: { user_id: userId, time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching production prediction:', error);
      throw error;
    }
  },

  // Get price prediction
  getPricePrediction: async (timeRange = 'day') => {
    try {
      const response = await axios.get(`${API_URL}/predictions/price`, {
        params: { time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching price prediction:', error);
      throw error;
    }
  },

  // Submit feedback on prediction accuracy
  submitPredictionFeedback: async (predictionId, accuracy, comments) => {
    try {
      const response = await axios.post(`${API_URL}/predictions/feedback`, {
        prediction_id: predictionId,
        accuracy_rating: accuracy,
        comments
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting prediction feedback:', error);
      throw error;
    }
  }
};

export default predictionService;