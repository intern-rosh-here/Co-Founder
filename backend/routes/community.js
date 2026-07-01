const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const communityController = require('../controllers/communityController');
const upload = require('../middleware/uploadCommunity');
// Get all posts
router.get('/', communityController.getPosts);

// Create post
router.post(
  '/create',
  auth,
  upload.array('media', 5),
  communityController.createPost
);
// Get post by ID
router.get('/:postId', auth, communityController.getPostById);

// Add comment
router.post('/:postId/comment', auth, communityController.addComment);

// Like post
router.post('/:postId/like', auth, communityController.likePost);

// Delete post
router.delete('/:postId', auth, communityController.deletePost);



module.exports = router;