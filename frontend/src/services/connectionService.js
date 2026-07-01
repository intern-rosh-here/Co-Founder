import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const connectionService = {
  // Send connection request
  sendRequest: async (receiverId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/connections/send`,
        { receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get connection status with another user
  getStatus: async (otherUserId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/connections/status/${otherUserId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting status:', error);
      return { success: false, status: 'no_connection', buttonStatus: 'no_connection' };
    }
  },

  // Accept connection request
  acceptRequest: async (connectionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/connections/accept`,
        { connectionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reject connection request
  rejectRequest: async (connectionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/connections/reject`,
        { connectionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all connections
  getConnections: async (status = 'accepted') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/connections?status=${status}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching connections:', error);
      return { success: false, data: [] };
    }
  },

  // Get pending requests
  getPendingRequests: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/connections/pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return { success: false, data: [] };
    }
  },

  // Cancel connection request
  cancelRequest: async (connectionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/connections/cancel`,
        { connectionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Start conversation with a user
startConversation: async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/connections/start-conversation`,
      { userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
},
  // Unconnect
  unconnect: async (otherUserId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/connections/unconnect`,
        { otherUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};


export default connectionService;