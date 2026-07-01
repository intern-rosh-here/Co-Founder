import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const communityService = {
  // Get all posts
  getPosts: async (category = 'All', page = 1, limit = 10) => {
    try {
      const token = localStorage.getItem('token');
      const params = { page, limit };
      if (category !== 'All') {
        params.category = category;
      }

      const response = await axios.get(`${API_URL}/community`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { success: false, data: [] };
    }
  },

  // Create post
  createPost: async (formData) => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.post(
      `${API_URL}/community/create`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
},

  // Get post by ID
  getPostById: async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/community/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add comment
  addComment: async (postId, content) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/community/${postId}/comment`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Like post
  likePost: async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/community/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete post
  deletePost: async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/community/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default communityService;