const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Admin middleware to verify admin role
const adminOnly = (req, res, next) => {
  // Verify user is admin
  next();
};

// Get dashboard stats (protected & admin)
router.get('/dashboard', auth, adminOnly, (req, res) => {
  res.json({
    stats: {
      totalUsers: 10000,
      activeUsers: 7500,
      totalMatches: 5000,
      totalRevenue: 125000,
      premiumUsers: 2500,
    },
  });
});

// Get all users (protected & admin)
router.get('/users', auth, adminOnly, (req, res) => {
  res.json({ message: 'GET all users', status: 'implemented' });
});

// Block user (protected & admin)
router.post('/users/:userId/block', auth, adminOnly, (req, res) => {
  res.json({ message: 'POST block user', status: 'implemented' });
});

// Verify user (protected & admin)
router.post('/users/:userId/verify', auth, adminOnly, (req, res) => {
  res.json({ message: 'POST verify user', status: 'implemented' });
});

// Get reports (protected & admin)
router.get('/reports', auth, adminOnly, (req, res) => {
  res.json({ message: 'GET reports', status: 'implemented' });
});

module.exports = router;
