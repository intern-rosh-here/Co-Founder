const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Connection = require('../models/Connection');

// ============================================
// MATCH PERCENTAGE CALCULATOR
// ============================================
const calculateMatchPercentage = (currentUser, potentialMatch) => {
  let matchScore = {
    industryMatch: 0,
    experienceMatch: 0,
    skillsMatch: 0,
    locationBonus: 0,
    stageMatch: 0,
    profileQuality: 0,
    totalPercentage: 0,
  };

  // 1. Industry Match (20%)
  if (currentUser.industry && potentialMatch.industry) {
    matchScore.industryMatch = currentUser.industry.toLowerCase() === 
      potentialMatch.industry.toLowerCase() ? 100 : 50;
  }

  // 2. Experience Match (15%)
  if (currentUser.experience && potentialMatch.experience) {
    const expMap = { '0-2 years': 1, '2-5 years': 2, '5-10 years': 3, '10+ years': 4 };
    const currentExp = expMap[currentUser.experience] || 0;
    const potentialExp = expMap[potentialMatch.experience] || 0;
    const diff = Math.abs(currentExp - potentialExp);
    matchScore.experienceMatch = Math.max(0, 100 - (diff * 25));
  }

  // 3. Skills Match (20%)
  if (currentUser.skills && potentialMatch.skills && 
      currentUser.skills.length > 0 && potentialMatch.skills.length > 0) {
    const commonSkills = currentUser.skills.filter(skill =>
      potentialMatch.skills.some(ps => 
        ps.toLowerCase() === skill.toLowerCase()
      )
    );
    const maxSkills = Math.max(currentUser.skills.length, potentialMatch.skills.length);
    matchScore.skillsMatch = (commonSkills.length / maxSkills) * 100;
  }

  // 4. Location Bonus (10%)
  if (currentUser.locationCity && potentialMatch.locationCity) {
    if (currentUser.locationCity.toLowerCase() === potentialMatch.locationCity.toLowerCase()) {
      matchScore.locationBonus = 100;
    } else if (currentUser.locationCountry && potentialMatch.locationCountry &&
               currentUser.locationCountry.toLowerCase() === potentialMatch.locationCountry.toLowerCase()) {
      matchScore.locationBonus = 50;
    }
  }

  // 5. Startup Stage Match (15%)
  if (currentUser.startupStage && potentialMatch.startupStage) {
    const stageMap = { 'Idea': 1, 'MVP': 2, 'Early Stage': 3, 'Growth': 4, 'Scaling': 5 };
    const currentStage = stageMap[currentUser.startupStage] || 0;
    const potentialStage = stageMap[potentialMatch.startupStage] || 0;
    const stageDiff = Math.abs(currentStage - potentialStage);
    matchScore.stageMatch = Math.max(0, 100 - (stageDiff * 20));
  }

  // 6. Profile Quality (10%)
  const profileCompleteness = (
    (potentialMatch.bio ? 15 : 0) +
    (potentialMatch.industry ? 15 : 0) +
    (potentialMatch.experience ? 15 : 0) +
    (potentialMatch.skills && potentialMatch.skills.length > 0 ? 15 : 0) +
    (potentialMatch.profileImage ? 15 : 0) +
    (potentialMatch.startupName ? 15 : 0) +
    (potentialMatch.locationCity ? 10 : 0)
  ) / 100 * 100;
  matchScore.profileQuality = profileCompleteness;

  // Calculate weighted total
  matchScore.totalPercentage = Math.round(
    (matchScore.industryMatch * 0.20) +
    (matchScore.experienceMatch * 0.15) +
    (matchScore.skillsMatch * 0.20) +
    (matchScore.locationBonus * 0.10) +
    (matchScore.stageMatch * 0.15) +
    (matchScore.profileQuality * 0.10)
  );

  return matchScore;
};

// ============================================
// GET ALL MATCHES
// ============================================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { sortBy = 'percentage', minPercentage = 50, skip = 0, limit = 20 } = req.query;

    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }





    
    // Get all accepted/pending connections for current user
const existingConnections = await Connection.find({
  $or: [
    { senderId: userId },
    { receiverId: userId }
  ],
  status: { $in: ['accepted', 'pending'] }
});

// IDs that should not appear in recommendations
const excludedIds = existingConnections.map(conn =>
  conn.senderId.toString() === userId.toString()
    ? conn.receiverId
    : conn.senderId
);

// Also exclude myself
excludedIds.push(userId);

const connectionMap = {};

existingConnections.forEach(conn => {
  const otherUser =
    conn.senderId.toString() === userId.toString()
      ? conn.receiverId.toString()
      : conn.senderId.toString();

  connectionMap[otherUser] = conn.status;
});

// Fetch only users who are not already connected
const potentialMatches = await User.find({
  _id: { $nin: excludedIds },
  isBlocked: false,
  bio: { $exists: true, $ne: '' },
  industry: { $exists: true, $ne: '' },
}).lean();

    // Calculate match percentages
    const matches = potentialMatches
      .map(match => {
        const matchCalc = calculateMatchPercentage(currentUser, match);
        return {
  ...match,
  matchPercentage: matchCalc.totalPercentage,
  industryMatch: matchCalc.industryMatch,
  experienceMatch: matchCalc.experienceMatch,
  skillsMatch: matchCalc.skillsMatch,
  locationBonus: matchCalc.locationBonus,
  stageMatch: matchCalc.stageMatch,
  profileQuality: matchCalc.profileQuality,

  // ADD THIS LINE
  connectionStatus: connectionMap[match._id.toString()] || "none",
};
      })
      .filter(m => m.matchPercentage >= minPercentage)
      .sort((a, b) => {
        if (sortBy === 'percentage') {
          return b.matchPercentage - a.matchPercentage;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(skip, skip + limit);

    res.json({
      data: matches,
      total: matches.length,
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Failed to fetch matches', error: error.message });
  }
});

// ============================================
// ACCEPT/LIKE MATCH
// ============================================
router.post('/:userId/accept', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.userId;
    const matchUserId = req.params.userId;

    // Add to current user's likes
    const currentUser = await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { likedBy: matchUserId } },
      { new: true }
    );

    res.json({ message: 'Match liked', user: currentUser });
  } catch (error) {
    console.error('Error accepting match:', error);
    res.status(500).json({ message: 'Failed to accept match', error: error.message });
  }
});

// ============================================
// REJECT/PASS MATCH
// ============================================
router.post('/:userId/reject', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.userId;
    const matchUserId = req.params.userId;

    // Add to current user's passed
    const currentUser = await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { passedBy: matchUserId } },
      { new: true }
    );

    res.json({ message: 'Match rejected', user: currentUser });
  } catch (error) {
    console.error('Error rejecting match:', error);
    res.status(500).json({ message: 'Failed to reject match', error: error.message });
  }
});

// ============================================
// GET MATCH ANALYSIS FOR A SINGLE USER
// ============================================
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const viewedUser = await User.findById(req.params.userId);

    if (!currentUser || !viewedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const result = calculateMatchPercentage(currentUser, viewedUser);

    res.json({
      success: true,
      data: {
        matchPercentage: result.totalPercentage,
        industryMatch: result.industryMatch,
        experienceMatch: result.experienceMatch,
        skillsMatch: result.skillsMatch,
        locationBonus: result.locationBonus,
        stageMatch: result.stageMatch,
        profileQuality: result.profileQuality,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate match',
    });
  }
});

// ============================================
// GET MUTUAL MATCHES
// ============================================
router.get('/mutual', authMiddleware, async (req, res) => {
  try {
    console.log("REQ USER:", req.user);
console.log("REQ USERID:", req.userId);
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        userId
      });
    }

    const mutualMatches = await User.find({
      _id: {
        $in: user.likedBy || [],
        $ne: userId,
      },
      likedBy: userId,
    }).lean();

    res.json({
      data: mutualMatches,
      total: mutualMatches.length,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch mutual matches',
      error: error.message
    });
  }
});

module.exports = router;