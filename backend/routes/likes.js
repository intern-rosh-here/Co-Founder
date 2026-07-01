const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const likeController = require('../controllers/likeController');

// Like a user
router.post('/like', auth, likeController.likeUser);

// Unlike a user
router.post('/unlike', auth, likeController.unlikeUser);

// Get like count for a user
router.get('/count/:userId', auth, likeController.getLikeCount);

// Check if current user liked another user
router.get('/check/:otherUserId', auth, likeController.checkIfLiked);

// Get all likes received by current user
router.get('/received', auth, likeController.getLikesReceived);

module.exports = router;