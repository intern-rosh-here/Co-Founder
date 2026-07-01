const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Register User
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
    });

    // Save user
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(201).json({
      token,
      user: user.toJSON(),
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account has been blocked' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.json({
      token,
      user: user.toJSON(),
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout
exports.logout = (req, res) => {
  try {
    // Since we're using stateless JWT, logout on client side
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Send OTP (Mock)
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    // In production, implement actual OTP sending via SMS/Email
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Store OTP in cache (Redis) or database
    // For now, just return success
    
    res.json({
      message: 'OTP sent successfully',
      // In development, you might return OTP for testing
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify OTP (Mock)
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Verify OTP from cache/database
    // For now, just verify
    
    res.json({
      message: 'OTP verified successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Google OAuth (Mock)
exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, firstName, lastName, profileImage } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user from Google data
      user = new User({
        email,
        firstName,
        lastName,
        profileImage,
        password: 'google_auth_' + Math.random(),
        isEmailVerified: true,
      });
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId).select('+password');

    // ADD THIS
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: 'Password login not enabled for this account'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid current password'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('CHANGE PASSWORD ERROR:', error);

    res.status(500).json({
      message: error.message
    });
  }
};