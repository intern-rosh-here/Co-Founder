const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/profiles'));
  },
  filename: (req, file, cb) => {
    cb(null, `${req.userId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }

    cb(new Error('Only image files are allowed'));
  },
});

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