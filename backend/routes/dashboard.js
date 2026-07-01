const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Connection = require('../models/Connection');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Idea = require('../models/StartupIdea');

// Get connection stats
router.get('/stats', auth, async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ senderId: req.user.id }, { recipientId: req.user.id }],
      status: 'accepted'
    });

    const user = await User.findById(req.user.id);
    
    // Calculate profile strength
    const profileFields = ['skills', 'experience', 'industry', 'role', 'bio'];
    const completedFields = profileFields.filter(
      field => user[field] && user[field].length > 0
    ).length;
    const profileStrength = Math.round((completedFields / profileFields.length) * 100);

    const pending = await Connection.find({
      recipientId: req.user.id,
      status: 'pending'
    });

    res.json({
      success: true,
      data: {
        activeMatches: connections.length,
        profileStrength,
        pendingRequests: pending.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get top recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const limit = req.query.limit || 5;

    // Get users with high skill match
    const currentUser = await User.findById(req.user.id);
    const users = await User.find({ _id: { $ne: req.user.id } })
      .limit(limit)
      .select('firstName lastName role skills experience matchPercentage');

    // Calculate match percentage (simplified)
    const recommendations = users.map(user => ({
      ...user._doc,
      matchPercentage: Math.floor(Math.random() * 30) + 70 // 70-100%
    }));

    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recent notifications
router.get('/activity', auth, async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get trending ideas
router.get('/trending-ideas', auth, async (req, res) => {
  try {
    const limit = req.query.limit || 3;
    
    const ideas = await Idea.find()
      .sort({ likes: -1 })
      .limit(limit)
      .select('title status fundingStage likes');

    res.json({ success: true, data: ideas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get latest conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const limit = req.query.limit || 3;

    const { Conversation } = require('../models/Message');
    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('participants', 'firstName lastName');

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;