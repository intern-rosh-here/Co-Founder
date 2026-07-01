const Notification = require('../models/Notification');

// ============================================
// GET ALL NOTIFICATIONS
// ============================================
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 20, skip = 0 } = req.query;

    const notifications = await Notification.find({ userId })
      .populate('fromUser', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Notification.countDocuments({ userId });
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.json({
      success: true,
      data: notifications,
      total,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

// ============================================
// GET UNREAD COUNT
// ============================================
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message,
    });
  }
};

// ============================================
// MARK NOTIFICATION AS READ
// ============================================
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
};

// ============================================
// MARK ALL AS READ
// ============================================
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all as read',
      error: error.message,
    });
  }
};

// ============================================
// DELETE NOTIFICATION
// ============================================
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndDelete(notificationId);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message,
    });
  }
};

// ============================================
// DELETE ALL NOTIFICATIONS
// ============================================
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    await Notification.deleteMany({ userId });

    res.json({
      success: true,
      message: 'All notifications deleted',
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete all notifications',
      error: error.message,
    });
  }
};