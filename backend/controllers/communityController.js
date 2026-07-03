const CommunityPost = require('../models/Community');
const User = require('../models/User');

// ============================================
// GET ALL COMMUNITY POSTS
// ============================================
exports.getPosts = async (req, res) => {
  try {
    const {
      category,
      authorId,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (page - 1) * limit;

    let query = {
      isDeleted: false,
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    // THIS IS THE IMPORTANT LINE
    if (authorId) {
      query.userId = authorId;
    }

    const posts = await CommunityPost.find(query)
      .populate(
        'userId',
        'firstName lastName profileImage'
      )
      .populate(
        'comments.userId',
        'firstName lastName profileImage'
      )
      .sort({
        isPinned: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(Number(limit));

    const total = await CommunityPost.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      total,
      pages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
    });
  }
};
// ============================================
// CREATE POST
// ============================================
exports.createPost = async (req, res) => {
  try {
    const userId = req.userId;
   const { title, content, category } = req.body;

const media =
  req.files?.map((file) => ({
    url: file.path,
    fileName: file.originalname,
    type: file.mimetype.startsWith('image')
      ? 'image'
      : file.mimetype.startsWith('video')
      ? 'video'
      : 'document',
  })) || [];

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    const post = new CommunityPost({
      userId,
      title,
      content,
      category: category || 'General',
      media,
    });

    await post.save();
    await post.populate('userId', 'firstName lastName profileImage');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message,
    });
  }
};

// ============================================
// GET POST BY ID
// ============================================
exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    let post = await CommunityPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (!post.viewedBy) {
      post.viewedBy = [];
    }

    if (req.userId) {
      const alreadyViewed = post.viewedBy.some(
        (id) => id.toString() === req.userId.toString()
      );

      if (!alreadyViewed) {
        post.views += 1;
        post.viewedBy.push(req.userId);

        await post.save();
      }
    }

    post = await CommunityPost.findById(postId)
      .populate(
        'userId',
        'firstName lastName profileImage bio professionalRole'
      )
      .populate(
        'comments.userId',
        'firstName lastName profileImage'
      );

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error fetching post:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: error.message,
    });
  }
};

// ============================================
// ADD COMMENT
// ============================================
exports.addComment = async (req, res) => {
  try {
    const userId = req.userId;
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    const post = await CommunityPost.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            userId,
            content,
          },
        },
      },
      { new: true }
    )
      .populate('userId', 'firstName lastName profileImage')
      .populate('comments.userId', 'firstName lastName profileImage');

    res.json({
      success: true,
      message: 'Comment added',
      data: post,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message,
    });
  }
};

// ============================================
// LIKE POST
// ============================================
exports.likePost = async (req, res) => {
  try {
    const userId = req.userId;
    const { postId } = req.params;

    const post = await CommunityPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const isLiked = post.likedBy.includes(userId);

    if (isLiked) {
      post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();
    await post.populate('userId', 'firstName lastName profileImage');

    res.json({
      success: true,
      message: isLiked ? 'Unliked' : 'Liked',
      data: post,
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post',
      error: error.message,
    });
  }
};

// ============================================
// DELETE POST
// ============================================
exports.deletePost = async (req, res) => {
  try {
    const userId = req.userId;
    const { postId } = req.params;

    const post = await CommunityPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    post.isDeleted = true;
    await post.save();

    res.json({
      success: true,
      message: 'Post deleted',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message,
    });
  }
};