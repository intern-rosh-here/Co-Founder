# Database Schema Documentation

## Overview
Cofounder Matrimony uses MongoDB as its NoSQL database. The following collections store all application data.

---

## Collections

### 1. Users Collection
Stores user account and profile information.

```javascript
{
  _id: ObjectId,
  
  // Basic Info
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  phone: String (required),
  password: String (required, hashed),
  
  // Profile Information
  profileImage: String,
  bio: String (max 500),
  dateOfBirth: Date,
  
  // Location
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      type: "Point",
      coordinates: [longitude, latitude]
    }
  },
  
  // Professional Info
  industry: String (enum),
  experience: String (enum),
  skillsEndorsed: [String],
  portfolio: String,
  linkedinProfile: String,
  gitHubProfile: String,
  
  // Startup Info
  startupStage: String (enum),
  lookingFor: [String],
  
  // Preferences
  preferences: {
    industryPreference: [String],
    experiencePreference: [String],
    locationPreference: [String],
    stagePreference: [String]
  },
  
  // Verification
  isEmailVerified: Boolean (default: false),
  isPhoneVerified: Boolean (default: false),
  isIdentityVerified: Boolean (default: false),
  trustScore: Number (0-100),
  
  // Subscription
  subscriptionType: String (enum: free|premium|enterprise),
  subscriptionExpiry: Date,
  
  // Role & Status
  role: String (enum: user|admin, default: user),
  isActive: Boolean (default: true),
  isBlocked: Boolean (default: false),
  
  // Metadata
  totalProfileViews: Number (default: 0),
  totalConnections: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- email (unique)
- location.coordinates (2dsphere)
- createdAt
- role

---

### 2. Matches Collection
Stores matching records and connection requests.

```javascript
{
  _id: ObjectId,
  
  userId: ObjectId (ref: User, required),
  matchedUserId: ObjectId (ref: User, required),
  
  compatibilityScore: Number (0-100),
  matchReason: [String],
  
  status: String (enum: pending|accepted|rejected|blocked),
  isFavorite: Boolean (default: false),
  
  viewedAt: Date,
  respondedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- userId, matchedUserId (compound)
- userId, status (compound)
- createdAt

---

### 3. Conversations Collection
Stores messaging conversations between users.

```javascript
{
  _id: ObjectId,
  
  participants: [ObjectId] (ref: User, required),
  
  lastMessage: String,
  lastMessageTime: Date,
  
  isArchived: Boolean (default: false),
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- participants
- updatedAt

---

### 4. Messages Collection
Stores individual messages within conversations.

```javascript
{
  _id: ObjectId,
  
  conversationId: ObjectId (ref: Conversation, required),
  senderId: ObjectId (ref: User, required),
  receiverId: ObjectId (ref: User, required),
  
  content: String (required),
  
  messageType: String (enum: text|image|video|file),
  attachmentUrl: String,
  
  isRead: Boolean (default: false),
  readAt: Date,
  
  isDeleted: Boolean (default: false),
  
  createdAt: Date
}
```

**Indexes:**
- conversationId, createdAt (compound)
- senderId, receiverId (compound)
- isRead

---

### 5. StartupIdeas Collection
Stores startup ideas in the marketplace.

```javascript
{
  _id: ObjectId,
  
  creatorId: ObjectId (ref: User, required),
  
  title: String (required),
  description: String (required),
  
  industry: String (required),
  stage: String (enum: Idea|MVP|Pre-Seed|Seed|Series A|Series B|Growth),
  
  fundingGoal: Number,
  fundingRaised: Number (default: 0),
  equityOffered: Number (percentage),
  
  skillsNeeded: [String],
  
  location: {
    city: String,
    country: String
  },
  
  images: [String],
  website: String,
  pitchDeck: String,
  
  // Interactions
  views: Number (default: 0),
  interests: [{
    userId: ObjectId (ref: User),
    expressedAt: Date
  }],
  totalInterests: Number (default: 0),
  
  // Status
  isActive: Boolean (default: true),
  isFeatured: Boolean (default: false),
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- creatorId
- stage
- industry
- createdAt

---

### 6. Subscriptions Collection
Stores user subscription information.

```javascript
{
  _id: ObjectId,
  
  userId: ObjectId (ref: User, required, unique),
  
  plan: String (enum: free|premium|enterprise),
  
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  
  startDate: Date (default: now),
  endDate: Date,
  
  amount: Number (default: 0),
  currency: String (default: USD),
  
  status: String (enum: active|canceled|suspended|expired),
  autoRenew: Boolean (default: true),
  
  paymentMethod: String (enum: card|paypal|bank_transfer),
  
  features: {
    unlimitedMessaging: Boolean,
    priorityMatching: Boolean,
    videoCall: Boolean,
    profileBadge: Boolean,
    advancedAnalytics: Boolean
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- userId (unique)
- status
- endDate

---

### 7. Notifications Collection
Stores user notifications.

```javascript
{
  _id: ObjectId,
  
  userId: ObjectId (ref: User, required),
  
  type: String (enum: connection|message|match|system),
  title: String,
  content: String,
  
  relatedUserId: ObjectId,
  relatedId: ObjectId,
  
  isRead: Boolean (default: false),
  readAt: Date,
  
  createdAt: Date
}
```

**Indexes:**
- userId, isRead
- createdAt

---

## Data Types

| Type | Description |
|------|-------------|
| String | Text data |
| Number | Numeric values |
| Boolean | true/false |
| Date | Timestamp |
| ObjectId | MongoDB reference ID |
| Array | List of items |
| Object | Nested data structure |
| Enum | Fixed set of values |

---

## Relationships

```
User (1) --- (N) Match
User (1) --- (N) Conversation
User (1) --- (N) Message
User (1) --- (N) StartupIdea
User (1) --- (1) Subscription
User (1) --- (N) Notification

Conversation (1) --- (N) Message
Conversation (N) --- (N) User
```

---

## Indexes Strategy

### Performance Optimization
- Indexed frequently queried fields
- Compound indexes for common query combinations
- Geospatial index for location-based queries
- TTL index for temporary data cleanup

### Index Recommendations
```javascript
// Users
db.users.createIndex({ email: 1 })
db.users.createIndex({ "location.coordinates": "2dsphere" })
db.users.createIndex({ createdAt: -1 })

// Matches
db.matches.createIndex({ userId: 1, matchedUserId: 1 })
db.matches.createIndex({ userId: 1, status: 1 })
db.matches.createIndex({ createdAt: -1 })

// Messages
db.messages.createIndex({ conversationId: 1, createdAt: -1 })
db.messages.createIndex({ senderId: 1, receiverId: 1 })
db.messages.createIndex({ isRead: 1 })

// Conversations
db.conversations.createIndex({ participants: 1 })
db.conversations.createIndex({ updatedAt: -1 })

// StartupIdeas
db.startupideas.createIndex({ creatorId: 1 })
db.startupideas.createIndex({ stage: 1 })
db.startupideas.createIndex({ industry: 1 })
db.startupideas.createIndex({ createdAt: -1 })
```

---

## Backup & Recovery

### Backup Strategy
- Daily automated backups
- Point-in-time recovery enabled
- Cross-region replication for disaster recovery

### Backup Commands
```bash
# Export data
mongoexport --uri "mongodb+srv://..." --collection users --out users.json

# Import data
mongoimport --uri "mongodb+srv://..." --collection users --file users.json
```

---

## Scalability Considerations

1. **Sharding**: Shard by userId for horizontal scaling
2. **Aggregation Pipeline**: Use for complex queries
3. **Connection Pooling**: Maintain optimal connection pool size
4. **TTL Indexes**: Auto-expire temporary data
5. **Archiving**: Archive old messages periodically

---

Last Updated: January 2024
