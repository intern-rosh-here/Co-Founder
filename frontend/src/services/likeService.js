import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const likeService = {
  // Like a user
  likeUser: async (likedUserId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/likes/like`,
        { likedUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Unlike a user
  unlikeUser: async (likedUserId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/likes/unlike`,
        { likedUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get like count for a user
  getLikeCount: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/likes/count/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting like count:', error);
      return { success: false, count: 0, likedBy: [] };
    }
  },

  // Check if current user liked another user
  checkIfLiked: async (otherUserId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/likes/check/${otherUserId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking like status:', error);
      return { success: false, isLiked: false };
    }
  },

  // Get all likes received
  getLikesReceived: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/likes/received`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching likes:', error);
      return { success: false, data: [] };
    }
  },
};

export default likeService;