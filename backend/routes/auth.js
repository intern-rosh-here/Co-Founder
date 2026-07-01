const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const path = require('path');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim(),
  body('phone').isMobilePhone(),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// Public Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/google-auth', authController.googleAuth);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);

// Protected Routes
router.get('/me', auth, authController.getCurrentUser);
router.post('/logout', auth, authController.logout);
router.post('/change-password', auth, authController.changePassword);

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
const userId = req.userId;    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
});

router.put('/notification-preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { notificationPreferences: req.body },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('NOTIFICATION ERROR:', error);

    res.status(500).json({
      message: 'Failed to update preferences',
      error: error.message
    });
  }
});

// Update privacy settings
router.put('/privacy-settings', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { privacySettings: req.body },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update privacy settings', error: error.message });
  }
});

// Get settings
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findById(userId).select('notificationPreferences privacySettings');

    res.json({
      notifications: user.notificationPreferences || {},
      privacy: user.privacySettings || {},
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings', error: error.message });
  }
});

// Delete account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;

    const user = await User.findById(userId).select('+password');

if (!user) {
  return res.status(404).json({
    message: 'User not found'
  });
}
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
});


module.exports = router;
