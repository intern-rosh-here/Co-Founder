const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');

const path = require('path');

// Multer configuration for file uploads

const { upload } = require('../config/cloudinary');

// ============================================
// BROWSE FOUNDERS (NEW)
// ============================================
router.get('/browse', auth, profileController.getAllFounders);

// Get my profile
router.get('/me', auth, profileController.getProfile);

// Update my profile
router.put('/me', auth, profileController.updateProfile);

// Upload profile picture
router.post('/me/avatar', auth, upload.single('profileImage'), profileController.uploadProfilePicture);

// Search profiles
router.get('/search', profileController.searchProfiles);

// Get public profile
router.get('/:userId', profileController.getPublicProfile);

// Delete profile
router.delete('/me', auth, profileController.deleteProfile);

module.exports = router;