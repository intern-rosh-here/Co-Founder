const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },

  // Profile Info
  profileImage: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  dateOfBirth: {
    type: Date,
  },

  location: {
    city: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },

  // Add to User schema
likedBy: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  default: [],
}],
passedBy: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
}],

connections: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
}],

connectionRequestsSent: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
}],

connectionRequestsReceived: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
}],

  // ADD THIS: Timezone
  timezone: {
    type: String,
    default: 'UTC',
  },

  // Professional Info
  industry: {
    type: String,
    enum: ['Technology', 'Finance', 'Healthcare', 'Retail', 'Education', 'Other'],
  },
  experience: {
    type: String,
    enum: ['0-2 years', '2-5 years', '5-10 years', '10+ years'],
  },
  previousRoles: {
  type: String,
  default: ''
},
  // ADD THIS: Skills array (different from skillsEndorsed)
  skills: {
    type: [String],
    default: [],
  },
  
  skillsEndorsed: {
    type: [String],
    default: [],
  },
  
  // ADD THIS: Professional Role (CEO, CTO, etc.)
  professionalRole: {
    type: String,
    default: '', // CEO, CTO, CFO, Founder, etc.
  },
  
  portfolio: {
    type: String,
  },
  linkedinProfile: {
    type: String,
    default: ''
  },
  gitHubProfile: {
    type: String,
    default: ''
  },
  
  // ADD THIS: Twitter URL
  twitterProfile: {
    type: String,
    default: ''
  },
  
  // ADD THIS: Website URL
  website: {
    type: String,
    default: ''
  },

  // Startup Info
  startupStage: {
    type: String,
    enum: ['Idea', 'MVP', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'],
  },
  
  // ADD THESE: Startup Details
  startupName: {
    type: String,
    default: '',
  },
  
  startupDescription: {
    type: String,
    maxlength: 1000,
    default: '',
  },
  
  startupFundingGoal: {
    type: Number,
    default: 0,
  },
  
  equityOffering: {
    type: Number,
    default: 0, // percentage 0-100
  },
  
  lookingFor: {
    type: [String],
    default: [],
  },

  // Preferences
  preferences: {
    industryPreference: [String],
    experiencePreference: [String],
    locationPreference: [String],
    stagePreference: [String],
  },
  // Notification Settings
notificationPreferences: {
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  matchNotifications: {
    type: Boolean,
    default: true,
  },
  messageNotifications: {
    type: Boolean,
    default: true,
  },
  marketingEmails: {
    type: Boolean,
    default: false,
  },
},

// Privacy Settings
privacySettings: {
  profileVisibility: {
    type: String,
    enum: ['public', 'private', 'hidden'],
    default: 'public',
  },
  showLocation: {
    type: Boolean,
    default: true,
  },
  allowMessages: {
    type: Boolean,
    default: true,
  },
  allowMatches: {
    type: Boolean,
    default: true,
  },
},

  // Verification
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  isIdentityVerified: {
    type: Boolean,
    default: false,
  },
  trustScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  // Subscription
  subscriptionType: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free',
  },
  subscriptionExpiry: {
    type: Date,
  },

  // Role
  role: {
  type: String,
  enum: [
    'Founder',
    'CEO',
    'CTO',
    'CPO',
    'COO',
    'CMO',
    'Product Manager',
    'Software Engineer',
    'Full Stack Developer',
    'UI/UX Designer',
    'Data Scientist',
    'AI/ML Engineer',
    'DevOps Engineer',
    'Cybersecurity Specialist',
    'Business Development',
    'Marketing Specialist',
    'Operations Manager',
    'Finance Manager',
    'Student Founder',
    
  ],
  default: 'Founder'
},

  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },

  // Metadata
  totalProfileViews: {
    type: Number,
    default: 0,
  },
  totalConnections: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get user without sensitive data
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

// Method to check if profile is complete
userSchema.methods.checkProfileCompletion = function () {
  return !!(
    this.firstName &&
    this.email &&
    this.bio &&
    this.industry &&
    this.experience &&
    this.location?.city &&
    this.skills?.length > 0
  );
};



module.exports = mongoose.model('User', userSchema);
