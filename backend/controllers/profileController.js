const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId || req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: user.toJSON(),
      isProfileComplete: user.checkProfileCompletion(),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  
  try {
    const userId = req.userId;
    const {
      firstName,
      lastName,
      bio,
      industry,
      experience,
      phone,
      startupStage,
      role,
      skills,
      locationCity,
      locationCountry,
      timezone,
      startupName,
      startupDescription,
      startupFundingGoal,
      previousRoles,
      equityOffering,
      linkedinProfile,
      gitHubProfile,
      twitterProfile,
      website,
      lookingFor,
      preferredIndustry,
      preferredLocation,
    } = req.body;

    console.log("REQUEST BODY:", req.body);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log("UPDATE BODY:", req.body);

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (bio) user.bio = bio;
    if (industry) user.industry = industry;
    if (experience) user.experience = experience;
    if (startupStage) user.startupStage = startupStage;
    if (role) user.role = role;
    if (skills) user.skills = skills;
    if (locationCity !== undefined) {
     user.location.city = locationCity;
    }
    if (locationCountry !== undefined) {
      user.location.country = locationCountry;
    }
    if (timezone) user.timezone = timezone;
    if (startupName) user.startupName = startupName;
    if (startupDescription) user.startupDescription = startupDescription;
    if (startupFundingGoal) user.startupFundingGoal = startupFundingGoal;
    if (equityOffering) user.equityOffering = equityOffering;
    if (linkedinProfile !== undefined)
     user.linkedinProfile = linkedinProfile;
    if (gitHubProfile !== undefined)
      user.gitHubProfile = gitHubProfile;
    if (twitterProfile !== undefined)
      user.twitterProfile = twitterProfile;
    if (website !== undefined)
      user.website = website;
    if (lookingFor) user.lookingFor = lookingFor;
    if (preferredIndustry) user.preferredIndustry = preferredIndustry;
    if (preferredLocation) user.preferredLocation = preferredLocation;
    if (previousRoles !== undefined)
  user.previousRoles = previousRoles;

    user.updatedAt = new Date();
    
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON(),
      isProfileComplete: user.checkProfileCompletion(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload Profile Picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile image if exists
    if (user.profileImage) {
      const oldPath = path.join(__dirname, '../', user.profileImage);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save new profile image path
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    user.profileImage = imageUrl;
    await user.save();

    res.json({
      message: 'Profile picture updated',
      profileImage: imageUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Public Profile
exports.getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search Profiles



// Search Profiles (existing - keep or update)
exports.searchProfiles = async (req, res) => {
  try {
    const { industry, experience, location, skills, startup } = req.query;
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;

    let query = { isProfileComplete: true };

    if (industry) query.industry = industry;
    if (experience) query.experience = experience;
    if (location) {
  query.$and = query.$and || [];

  query.$and.push({
    $or: [
      { 'location.city': new RegExp(location, 'i') },
      { 'location.state': new RegExp(location, 'i') },
      { 'location.country': new RegExp(location, 'i') }
    ]
  });
}
    if (skills) {
      query.skills = { $in: Array.isArray(skills) ? skills : [skills] };
    }
    if (startup) {
      query.$or = [
        { startupName: new RegExp(startup, 'i') },
        { startupDescription: new RegExp(startup, 'i') },
      ];
    }

    const users = await User.find(query).limit(limit).skip(skip);
    const total = await User.countDocuments(query);

    res.json({
      users: users.map(u => u.toJSON()),
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Delete Profile
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all founders (Browse page)
exports.getAllFounders = async (req, res) => {
  console.log('GET ALL FOUNDERS CALLED');
  try {
    const userId = req.userId; // From auth middleware
    
    // Get query parameters
    const { search = '', industry = '', experience = '', location = '', skip = 0, limit = 20 } = req.query;

    // Build filter object
 let filter = {
  _id: { $ne: userId },
  isActive: true,
  isBlocked: false,
  'privacySettings.profileVisibility': { $ne: 'hidden' }
};
    // Search by name or bio
    if (search && search.trim() !== '') {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { professionalRole: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    // Industry filter
    if (industry && industry.trim() !== '') {
      filter.industry = { $regex: industry, $options: 'i' };
    }

    // Experience filter
    if (experience && experience.trim() !== '') {
      filter.experience = experience;
    }

    // Location filter
    if (location && location.trim() !== '') {
  filter.$or = [
    { 'location.city': { $regex: location, $options: 'i' } },
    { 'location.state': { $regex: location, $options: 'i' } },
    { 'location.country': { $regex: location, $options: 'i' } }
  ];
}

    console.log('🔍 Browse filter:', JSON.stringify(filter, null, 2));

    // Count total
    const total = await User.countDocuments(filter);

    const allUsers = await User.find({})
  .select('firstName email isActive isBlocked bio industry privacySettings');

console.log('ALL USERS:');
console.log(JSON.stringify(allUsers, null, 2));

    // Get founders with pagination
    const founders = await User.find(filter)
  .select(
    'firstName lastName email bio industry experience location skills role profileImage startupName startupDescription startupFundingGoal startupStage _id'
  )
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    console.log(`✅ Found ${founders.length} founders out of ${total} total`);

    console.log('FOUNDERS:', founders);

    res.json({
      data: founders,
      total,
      count: founders.length,
    });
  } 
  
  catch (error) {
    console.error('❌ Browse founders error:', error);
    res.status(500).json({ message: 'Failed to fetch founders', error: error.message });
  }
  
  
};