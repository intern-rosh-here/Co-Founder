import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const dashboardService = {
  
  // Get all dashboard metrics
  getDashboardMetrics: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/metrics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get success probability score
  getSuccessProbability: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/success-probability`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get network strength
  getNetworkStrength: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/network-strength`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get AI match score
  getAIMatchScore: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/ai-match-score`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get growth forecast
  getGrowthForecast: async (months = 6) => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/growth-forecast`, {
        params: { months },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get profile visibility data
  getProfileVisibility: async (timeRange = 'month') => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/profile-visibility`, {
        params: { timeRange },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get activity heatmap
  getActivityHeatmap: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/activity-heatmap`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get risk assessment
  getRiskAssessment: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/risk-assessment`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get team synergy analysis
  getTeamSynergy: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/team-synergy`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get market insights
  getMarketInsights: async (industry = null) => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/market-insights`, {
        params: { industry },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get predictions
  getPredictions: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/predictions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search co-founders with AI
  searchCofounderersAI: async (query, filters = []) => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/search`, {
        params: { query, filters: filters.join(',') },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top matches
  getTopMatches: async (limit = 5) => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/top-matches`, {
        params: { limit },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Export dashboard data
  exportDashboard: async (format = 'pdf') => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/export`, {
        params: { format },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get engagement metrics
  getEngagementMetrics: async (timeRange = 'month') => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/engagement`, {
        params: { timeRange },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get match quality score
  getMatchQuality: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/match-quality`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get response time metrics
  getResponseTime: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/response-time`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get skill strength analysis
  getSkillStrength: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/skill-strength`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default dashboardService;