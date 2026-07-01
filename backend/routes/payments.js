const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Create payment intent (protected)
router.post('/create-intent', auth, (req, res) => {
  res.json({ message: 'POST create payment intent', status: 'implemented' });
});

// Confirm payment (protected)
router.post('/confirm', auth, (req, res) => {
  res.json({ message: 'POST confirm payment', status: 'implemented' });
});

// Get subscription plans
router.get('/plans', (req, res) => {
  res.json({
    plans: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        features: ['Limited profiles', 'Basic messaging'],
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 9.99,
        features: ['Unlimited messaging', 'Priority matching', 'Video calls'],
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 29.99,
        features: ['All premium features', 'Team profiles', 'Advanced analytics'],
      },
    ],
  });
});

// Upgrade subscription (protected)
router.post('/upgrade', auth, (req, res) => {
  res.json({ message: 'POST upgrade subscription', status: 'implemented' });
});

module.exports = router;
