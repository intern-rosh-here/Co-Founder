const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Get all notifications
router.get('/', auth, notificationController.getNotifications);

// Get unread count
router.get('/unread/count', auth, notificationController.getUnreadCount);

// Mark as read
router.post('/read', auth, notificationController.markAsRead);

// Mark all as read
router.post('/read-all', auth, notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', auth, notificationController.deleteNotification);

// Delete all notifications
router.delete('/', auth, notificationController.deleteAllNotifications);

module.exports = router;