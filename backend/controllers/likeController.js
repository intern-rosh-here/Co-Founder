const Like = require('../models/Like');
const Notification = require('../models/Notification');
const User = require('../models/User');

// ============================================
// LIKE A USER
// ============================================
exports.likeUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { likedUserId } = req.body;

    if (!likedUserId) {
      return res.status(400).json({
        success: false,
        message: 'Liked user ID is required',
      });
    }

    if (userId.toString() === likedUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot like yourself',
      });
    }

    // Check if already liked
    const existingLike = await Like.findOne({ userId, likedUserId });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: 'Already liked this user',
      });
    }

    // Create like
    const like = new Like({ userId, likedUserId });
    await like.save();

    // Create notification
    const likerUser = await User.findById(userId);
    const notification = new Notification({
      userId: likedUserId,
      type: 'liked',
      fromUser: userId,
      message: `${likerUser.firstName} ${likerUser.lastName} liked your profile ❤️`,
    });

    await notification.save();

    console.log(`❤️ ${userId} liked ${likedUserId}`);

    res.status(201).json({
      success: true,
      message: 'User liked',
      data: like,
    });
  } catch (error) {
    console.error('Error liking user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like user',
      error: error.message,
    });
  }
};

// ============================================
// UNLIKE A USER
// ============================================
exports.unlikeUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { likedUserId } = req.body;

    const like = await Like.findOne({ userId, likedUserId });

    if (!like) {
      return res.status(404).json({
        success: false,
        message: 'Like not found',
      });
    }

    await Like.findByIdAndDelete(like._id);

    console.log(`💔 ${userId} unliked ${likedUserId}`);

    res.json({
      success: true,
      message: 'User unliked',
    });
  } catch (error) {
    console.error('Error unliking user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlike user',
      error: error.message,
    });
  }
};

// ============================================
// GET LIKE COUNT FOR A USER
// ============================================
exports.getLikeCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const likeCount = await Like.countDocuments({ likedUserId: userId });

    // Get all users who liked this user
    const likes = await Like.find({ likedUserId: userId })
      .populate('userId', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: likeCount,
      likedBy: likes,
    });
  } catch (error) {
    console.error('Error getting like count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get like count',
      error: error.message,
    });
  }
};

// ============================================
// CHECK IF CURRENT USER LIKED ANOTHER USER
// ============================================
exports.checkIfLiked = async (req, res) => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.params;

    const like = await Like.findOne({ userId, likedUserId: otherUserId });

    res.json({
      success: true,
      isLiked: !!like,
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check like status',
      error: error.message,
    });
  }
};

// ============================================
// GET ALL LIKES RECEIVED
// ============================================
exports.getLikesReceived = async (req, res) => {
  try {
    const userId = req.userId;

    const likes = await Like.find({ likedUserId: userId })
      .populate('userId', 'firstName lastName profileImage email industry')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: likes,
      count: likes.length,
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch likes',
      error: error.message,
    });
  }
};