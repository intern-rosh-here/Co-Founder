import axios from 'axios';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

const notificationService = {
  // Initialize Socket.io
  initSocket: (userId) => {
    if (!socket) {
      const token = localStorage.getItem('token');
      socket = io(SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('✅ Notification socket connected');
        socket.emit('user_online', userId);
      });

      socket.on('disconnect', () => {
        console.log('❌ Notification socket disconnected');
      });
    }
    return socket;
  },

  // Get all notifications
  getNotifications: async (limit = 20, skip = 0) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/notifications?limit=${limit}&skip=${skip}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, data: [], unreadCount: 0 };
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/notifications/unread/count`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return { success: false, unreadCount: 0 };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/notifications/read`,
        { notificationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },

  deleteNotification: async (notificationId) => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.delete(
      `${API_URL}/notifications/${notificationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Delete notification error:', error);
    throw error;
  }
},

  // Socket events
  onNewNotification: (callback) => {
    if (socket) {
      socket.on('notification_received', callback);
    }
  },

  disconnectSocket: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },
};

export default notificationService;