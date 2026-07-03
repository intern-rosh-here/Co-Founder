import axios from 'axios';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;
let messageCallbacks = [];
let typingCallbacks = [];

const messagesService = {
  // Initialize Socket.io with IMMEDIATE listeners
  initSocket: (userId) => {
    if (socket?.connected) {
      console.log('🔌 Socket already connected');
      return socket;
    }

    console.log(`🔌 Initializing Socket.io for user: ${userId}`);
    const token = localStorage.getItem('token');

    socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // ============ LISTEN FOR MESSAGES IMMEDIATELY ============
    socket.on('message_received', (data) => {
      console.log('🎯🎯🎯 [SOCKET EVENT] message_received FIRED!', data);
      
      // Call ALL registered callbacks
      messageCallbacks.forEach((callback) => {
        console.log('📢 Calling callback with message:', data);
        callback(data);
      });
    });

    // ============ LISTEN FOR TYPING IMMEDIATELY ============
    socket.on('user_typing', (data) => {
      console.log('⌨️ [SOCKET EVENT] user_typing FIRED:', data);
      typingCallbacks.forEach((callback) => {
        callback(data);
      });
    });

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      if (userId) {
        socket.emit('user_online', userId);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    return socket;
  },

  // Get conversations
  getConversations: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return { success: false, data: [] };
    }
  },

  // Get messages
  getMessages: async (conversationId, skip = 0, limit = 500) => {
    try {
      const token = localStorage.getItem('token');
      console.log(`📥 Fetching messages for: ${conversationId}`);

      const response = await axios.get(
        `${API_URL}/messages/${conversationId}?skip=${skip}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(`✅ Got ${response.data.messages?.length || 0} messages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { success: false, messages: [], total: 0 };
    }
  },

  // Send message
  sendMessage: async (conversationId, content) => {
    try {
      const token = localStorage.getItem('token');
      console.log(`📤 Sending message to: ${conversationId}`);

      const response = await axios.post(
        `${API_URL}/messages/send`,
        { conversationId, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(`✅ Message sent`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error.response?.data || error;
    }
  },

  // Create conversation
  createConversation: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/messages/create`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark as read
  markAsRead: async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/messages/${conversationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  },

  // Register message callback (can be called multiple times)
  onNewMessage: (callback) => {
  messageCallbacks = [callback]; // keep only one callback
},

  // Register typing callback
  onTyping: (callback) => {
    console.log('📌 Registering typing callback');
    typingCallbacks.push(callback);
  },

  // Send typing indicator
  sendTyping: (conversationId, isTyping) => {
    if (socket?.connected) {
      socket.emit('typing', { conversationId, isTyping });
    }
  },

  // Join conversation room
  joinConversation: (conversationId) => {
    if (socket?.connected) {
      console.log(`📢 Joining room: conversation_${conversationId}`);
      socket.emit('join_conversation', conversationId);
    } else {
      console.warn('⚠️ Socket not connected!');
    }
  },

  // Leave conversation room
  leaveConversation: (conversationId) => {
    if (socket?.connected) {
      console.log(`👋 Leaving room: conversation_${conversationId}`);
      socket.emit('leave_conversation', conversationId);
    }
  },

  // Disconnect socket
  disconnectSocket: () => {
    if (socket) {
      console.log('🔌 Disconnecting socket');
      socket.disconnect();
      socket = null;
      messageCallbacks = [];
      typingCallbacks = [];
    }
  },

  deleteConversation: async (conversationId) => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.delete(
      `${API_URL}/messages/conversation/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
},

  // Get socket
  getSocket: () => socket,
};

export default messagesService;