import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const matchesService = {
  // Get all matches for current user
  getMatches: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.minPercentage) params.append('minPercentage', filters.minPercentage);
      if (filters.skip) params.append('skip', filters.skip);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await axios.get(`${API_URL}/matches`, {
        params: Object.fromEntries(params),
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching matches:', error);
      return { data: [], total: 0 };
    }
  },

  // Accept/Like a match
  acceptMatch: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/matches/${userId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reject/Pass on a match
  rejectMatch: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/matches/${userId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get mutual matches
  getMutualMatches: async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${API_URL}/matches/mutual`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching mutual matches:', error);
      return { data: [], total: 0 };
    }
  },
};

export default matchesService;