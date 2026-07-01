const StartupIdea = require('../models/StartupIdea');
const User = require('../models/User');

// ============================================
// GET ALL IDEAS
// ============================================
// ============================================
exports.getIdeas = async (req, res) => {
  try {

    const {
      industry,
      fundingStage,
      status,
      createdBy,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (page - 1) * limit;

    let query = {
      isDeleted: false
    };

    if (industry)
      query.industry = industry;

    if (fundingStage)
      query.fundingStage = fundingStage;

    if (status)
      query.status = status;

    // IMPORTANT
    if (createdBy)
      query.userId = createdBy;

    const ideas = await StartupIdea.find(query)
      .populate(
        'userId',
        'firstName lastName profileImage industry'
      )
      .populate(
        'comments.userId',
        'firstName lastName profileImage'
      )
      .sort({
        createdAt: -1
      })
      .skip(skip)
      .limit(Number(limit));

    const total = await StartupIdea.countDocuments(query);

    res.json({
      success: true,
      data: ideas,
      total,
      pages: Math.ceil(total / limit),
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch ideas'
    });

  }
};

// ============================================
// CREATE IDEA
// ============================================
exports.createIdea = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      title,
      description,
      problemStatement,
      solution,
      targetMarket,
      industry,
      fundingStage,
      estimatedFunding,
    } = req.body;

    if (!title || !description || !problemStatement || !solution) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, problem statement, and solution are required',
      });
    }

    const idea = new StartupIdea({
      userId,
      title,
      description,
      problemStatement,
      solution,
      targetMarket,
      industry,
      fundingStage: fundingStage || 'Idea',
      estimatedFunding,
    });

    await idea.save();
    await idea.populate('userId', 'firstName lastName profileImage industry');

    res.status(201).json({
      success: true,
      message: 'Idea created successfully',
      data: idea,
    });
  } catch (error) {
    console.error('Error creating idea:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create idea',
      error: error.message,
    });
  }
};

// ============================================
// GET IDEA BY ID
// ============================================
exports.getIdeaById = async (req, res) => {
  try {
    const { ideaId } = req.params;

    let idea = await StartupIdea.findById(ideaId);

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    if (!idea.viewedBy) {
      idea.viewedBy = [];
    }

    if (req.userId) {
      const alreadyViewed = idea.viewedBy.some(
        (id) => id.toString() === req.userId.toString()
      );

      if (!alreadyViewed) {
        idea.views += 1;
        idea.viewedBy.push(req.userId);

        await idea.save();
      }
    }

    idea = await StartupIdea.findById(ideaId)
      .populate(
        'userId',
        'firstName lastName profileImage bio industry email professionalRole'
      )
      .populate(
        'comments.userId',
        'firstName lastName profileImage'
      );

    res.json({
      success: true,
      data: idea,
    });
  } catch (error) {
    console.error('Error fetching idea:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch idea',
      error: error.message,
    });
  }
};

// ============================================
// UPDATE IDEA
// ============================================
exports.updateIdea = async (req, res) => {
  try {
    const userId = req.userId;
    const { ideaId } = req.params;
    const { title, description, problemStatement, solution, targetMarket, status } = req.body;

    const idea = await StartupIdea.findById(ideaId);

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    if (idea.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this idea',
      });
    }

    if (title) idea.title = title;
    if (description) idea.description = description;
    if (problemStatement) idea.problemStatement = problemStatement;
    if (solution) idea.solution = solution;
    if (targetMarket) idea.targetMarket = targetMarket;
    if (status) idea.status = status;

    await idea.save();
    await idea.populate('userId', 'firstName lastName profileImage');

    res.json({
      success: true,
      message: 'Idea updated',
      data: idea,
    });
  } catch (error) {
    console.error('Error updating idea:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update idea',
      error: error.message,
    });
  }
};

// ============================================
// ADD COMMENT TO IDEA
// ============================================
exports.addComment = async (req, res) => {
  try {
    const userId = req.userId;
    const { ideaId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    const idea = await StartupIdea.findByIdAndUpdate(
      ideaId,
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
      data: idea,
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
// LIKE IDEA
// ============================================
exports.likeIdea = async (req, res) => {
  try {
    const userId = req.userId;
    const { ideaId } = req.params;

    const idea = await StartupIdea.findById(ideaId);

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    const isLiked = idea.likedBy.includes(userId);

    if (isLiked) {
      idea.likedBy = idea.likedBy.filter((id) => id.toString() !== userId);
      idea.likes = Math.max(0, idea.likes - 1);
    } else {
      idea.likedBy.push(userId);
      idea.likes += 1;
    }

    await idea.save();
    await idea.populate('userId', 'firstName lastName profileImage');

    res.json({
      success: true,
      message: isLiked ? 'Unliked' : 'Liked',
      data: idea,
    });
  } catch (error) {
    console.error('Error liking idea:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like idea',
      error: error.message,
    });
  }
};

// ============================================
// DELETE IDEA
// ============================================
exports.deleteIdea = async (req, res) => {
  try {
    const userId = req.userId;
    const { ideaId } = req.params;

    const idea = await StartupIdea.findById(ideaId);

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    if (idea.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this idea',
      });
    }

    idea.isDeleted = true;
    await idea.save();

    res.json({
      success: true,
      message: 'Idea deleted',
    });
  } catch (error) {
    console.error('Error deleting idea:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete idea',
      error: error.message,
    });
  }
};