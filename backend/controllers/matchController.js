const Match = require('../models/Match');
const User = require('../models/User');

// Calculate compatibility score
const calculateCompatibilityScore = (user1, user2) => {
  let score = 0;
  let reasons = [];

  // Industry match
  if (user1.industry === user2.industry) {
    score += 20;
    reasons.push('Same industry');
  }

  // Experience level compatibility
  const experienceLevels = ['0-2 years', '2-5 years', '5-10 years', '10+ years'];
  const exp1 = experienceLevels.indexOf(user1.experience);
  const exp2 = experienceLevels.indexOf(user2.experience);
  
  if (Math.abs(exp1 - exp2) <= 1) {
    score += 15;
    reasons.push('Compatible experience levels');
  }

  // Startup stage match
  if (user1.startupStage === user2.startupStage) {
    score += 20;
    reasons.push('Same startup stage');
  }

  // Skills compatibility
  const commonSkills = user1.skillsEndorsed.filter((skill) =>
    user2.skillsEndorsed.includes(skill)
  ).length;
  
  if (commonSkills > 0) {
    score += Math.min(commonSkills * 10, 25);
    reasons.push(`${commonSkills} common skills`);
  }

  // Location preference
  if (user1.location?.city === user2.location?.city) {
    score += 10;
    reasons.push('Same location');
  }

  // Trust score consideration
  score += (user2.trustScore / 100) * 10;

  return {
    score: Math.min(Math.round(score), 100),
    reasons,
  };
};

// Get recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all users except current user
    const potentialMatches = await User.find({
      _id: { $ne: req.userId },
      isBlocked: false,
    }).limit(50);

    // Calculate compatibility scores
    const matches = potentialMatches.map((match) => {
      const { score, reasons } = calculateCompatibilityScore(user, match);
      return {
        userId: match._id,
        firstName: match.firstName,
        lastName: match.lastName,
        profileImage: match.profileImage,
        industry: match.industry,
        experience: match.experience,
        location: match.location,
        compatibilityScore: score,
        matchReasons: reasons,
      };
    });

    // Sort by compatibility score
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json(matches.slice(0, 10));
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get matches with filters
exports.getMatches = async (req, res) => {
  try {
    const { industry, stage, experience, location, minScore } = req.query;

    const query = { userId: req.userId };

    if (industry) query.matchedUserId = { $in: await User.find({ industry }).select('_id') };
    if (stage) query.stage = stage;

    const matches = await Match.find(query)
      .populate('matchedUserId', 'firstName lastName profileImage industry experience')
      .sort({ compatibilityScore: -1 });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Save profile
exports.saveProfile = async (req, res) => {
  try {
    const { profileId } = req.params;

    const existingMatch = await Match.findOne({
      userId: req.userId,
      matchedUserId: profileId,
    });

    if (existingMatch) {
      existingMatch.isFavorite = !existingMatch.isFavorite;
      await existingMatch.save();
    } else {
      const match = new Match({
        userId: req.userId,
        matchedUserId: profileId,
        compatibilityScore: 0,
        isFavorite: true,
      });
      await match.save();
    }

    res.json({ message: 'Profile saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Send connection request
exports.sendConnection = async (req, res) => {
  try {
    const { profileId } = req.params;

    const targetUser = await User.findById(profileId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if connection already exists
    const existingMatch = await Match.findOne({
      userId: req.userId,
      matchedUserId: profileId,
    });

    if (existingMatch) {
      return res.status(400).json({ message: 'Connection already exists' });
    }

    const { score, reasons } = calculateCompatibilityScore(
      await User.findById(req.userId),
      targetUser
    );

    const match = new Match({
      userId: req.userId,
      matchedUserId: profileId,
      compatibilityScore: score,
      matchReason: reasons,
      status: 'pending',
    });

    await match.save();

    res.json({
      message: 'Connection request sent',
      match,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept connection
exports.acceptConnection = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findByIdAndUpdate(
      matchId,
      { status: 'accepted', respondedAt: new Date() },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Update total connections
    await User.findByIdAndUpdate(
      req.userId,
      { $inc: { totalConnections: 1 } }
    );
    await User.findByIdAndUpdate(
      match.userId,
      { $inc: { totalConnections: 1 } }
    );

    res.json({ message: 'Connection accepted', match });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject connection
exports.rejectConnection = async (req, res) => {
  try {
    const { matchId } = req.params;

    await Match.findByIdAndUpdate(
      matchId,
      { status: 'rejected', respondedAt: new Date() }
    );

    res.json({ message: 'Connection rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
