const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.get('/unread-count', auth, messageController.getUnreadCount);

// Get all conversations
router.get('/conversations', auth, messageController.getConversations);

// Get messages in conversation
router.get('/:conversationId', auth, messageController.getMessages);

// Create conversation
router.post('/create', auth, messageController.createConversation);

// Send message
router.post('/send', auth, messageController.sendMessage);

// Mark as read
router.put('/:conversationId/read', auth, messageController.markAsRead);

router.delete(
  '/conversation/:conversationId',
  auth,
  messageController.deleteConversation
);

module.exports = router;