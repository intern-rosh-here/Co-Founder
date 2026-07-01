import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ideaService = {
  // Get all ideas
  getIdeas: async (industry = null, fundingStage = null, status = null, page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const params = { page, limit: 10 };
      if (industry) params.industry = industry;
      if (fundingStage) params.fundingStage = fundingStage;
      if (status) params.status = status;

      const response = await axios.get(`${API_URL}/ideas`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching ideas:', error);
      return { success: false, data: [] };
    }
  },

  // Create idea
  createIdea: async (ideaData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/ideas/create`, ideaData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get idea by ID
  getIdeaById: async (ideaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/ideas/${ideaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update idea
  updateIdea: async (ideaId, ideaData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/ideas/${ideaId}`, ideaData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add comment
  addComment: async (ideaId, content) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/ideas/${ideaId}/comment`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Like idea
  likeIdea: async (ideaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/ideas/${ideaId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete idea
  deleteIdea: async (ideaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/ideas/${ideaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default ideaService;