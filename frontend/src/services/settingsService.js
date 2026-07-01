import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const settingsService = {
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/notification-preferences`,
        preferences,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update privacy settings
  updatePrivacySettings: async (settings) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/privacy-settings`,
        settings,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete account
  deleteAccount: async (password) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/auth/account`, {
        data: { password },
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get settings
  getSettings: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default settingsService;