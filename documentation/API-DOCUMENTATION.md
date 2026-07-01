# Cofounder Matrimony API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All responses are in JSON format with the following structure:
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

Response (201):
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### 2. Login User
**POST** `/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

### 3. Get Current User
**GET** `/auth/me` (Protected)

Response (200):
```json
{
  "user": { ... }
}
```

### 4. Change Password
**POST** `/auth/change-password` (Protected)

Request:
```json
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

Response (200):
```json
{
  "message": "Password changed successfully"
}
```

---

## Profile Endpoints

### 1. Get User Profile
**GET** `/profiles/:userId`

Response (200):
```json
{
  "_id": "user_id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "bio": "Passionate entrepreneur...",
  "profileImage": "image_url",
  "industry": "Technology",
  "experience": "5-10 years",
  "location": { "city": "San Francisco", "country": "USA" },
  "trustScore": 85,
  "totalProfileViews": 120
}
```

### 2. Update Profile
**PUT** `/profiles/update` (Protected)

Request:
```json
{
  "bio": "Updated bio",
  "industry": "Finance",
  "experience": "10+ years",
  "skillsEndorsed": ["Leadership", "Finance", "Strategy"]
}
```

Response (200):
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

### 3. Upload Profile Image
**POST** `/profiles/upload-image` (Protected)

Request: multipart/form-data
- Field name: `image`
- File: profile image (JPG, PNG)

Response (200):
```json
{
  "message": "Image uploaded successfully",
  "user": { ... }
}
```

### 4. Endorse Skill
**POST** `/profiles/endorse-skill` (Protected)

Request:
```json
{
  "skill": "Leadership",
  "targetUserId": "user_id"
}
```

Response (200):
```json
{
  "message": "Skill endorsed successfully"
}
```

### 5. Get Profile Completeness
**GET** `/profiles/completeness/status` (Protected)

Response (200):
```json
{
  "completeness": 75,
  "completedFields": 6,
  "totalFields": 8
}
```

### 6. Search Profiles
**GET** `/profiles/search/results?industry=Technology&experience=5-10+years`

Query Parameters:
- `industry` - Filter by industry
- `experience` - Filter by experience level
- `skills` - Comma-separated skill list
- `stage` - Startup stage
- `location` - Location filter

Response (200):
```json
[
  {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "profileImage": "image_url",
    "industry": "Technology",
    "experience": "5-10 years"
  }
]
```

---

## Match Endpoints

### 1. Get Recommendations
**GET** `/matches/recommendations` (Protected)

Response (200):
```json
[
  {
    "userId": "user_id",
    "firstName": "Jane",
    "lastName": "Smith",
    "profileImage": "image_url",
    "compatibilityScore": 92,
    "matchReasons": ["Same industry", "Compatible experience"]
  }
]
```

### 2. Get Matches
**GET** `/matches?status=pending` (Protected)

Query Parameters:
- `status` - Match status (pending, accepted, rejected)
- `industry` - Filter by industry
- `stage` - Filter by startup stage

Response (200):
```json
[
  {
    "_id": "match_id",
    "userId": "user_id",
    "matchedUserId": { ... },
    "compatibilityScore": 85,
    "status": "pending"
  }
]
```

### 3. Save Profile
**POST** `/matches/save/:profileId` (Protected)

Response (200):
```json
{
  "message": "Profile saved successfully"
}
```

### 4. Send Connection Request
**POST** `/matches/connect/:profileId` (Protected)

Response (201):
```json
{
  "message": "Connection request sent",
  "match": { ... }
}
```

### 5. Accept Connection
**POST** `/matches/accept/:matchId` (Protected)

Response (200):
```json
{
  "message": "Connection accepted"
}
```

### 6. Reject Connection
**POST** `/matches/reject/:matchId` (Protected)

Response (200):
```json
{
  "message": "Connection rejected"
}
```

---

## Message Endpoints

### 1. Get Conversations
**GET** `/messages/conversations` (Protected)

Response (200):
```json
[
  {
    "_id": "conversation_id",
    "participants": [ { ... } ],
    "lastMessage": "Hey, how are you?",
    "lastMessageTime": "2024-01-15T10:30:00Z",
    "unreadCount": 2
  }
]
```

### 2. Get Messages
**GET** `/messages/:conversationId` (Protected)

Response (200):
```json
[
  {
    "_id": "message_id",
    "conversationId": "conversation_id",
    "senderId": { ... },
    "content": "Hello!",
    "createdAt": "2024-01-15T10:30:00Z",
    "isRead": true
  }
]
```

### 3. Send Message
**POST** `/messages/:conversationId/send` (Protected)

Request:
```json
{
  "content": "Hello, interested in collaborating?",
  "receiverId": "receiver_user_id"
}
```

Response (201):
```json
{
  "_id": "message_id",
  "conversationId": "conversation_id",
  "senderId": { ... },
  "content": "Hello, interested in collaborating?",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 4. Create Conversation
**POST** `/messages/create` (Protected)

Request:
```json
{
  "userId": "other_user_id"
}
```

Response (201):
```json
{
  "_id": "conversation_id",
  "participants": [ ... ]
}
```

### 5. Delete Conversation
**DELETE** `/messages/:conversationId` (Protected)

Response (200):
```json
{
  "message": "Conversation deleted"
}
```

### 6. Mark as Read
**PUT** `/messages/:conversationId/read` (Protected)

Response (200):
```json
{
  "message": "Messages marked as read"
}
```

### 7. Get Unread Count
**GET** `/messages/unread/count` (Protected)

Response (200):
```json
{
  "unreadCount": 5
}
```

---

## Startup Ideas Endpoints

### 1. Get All Ideas
**GET** `/startups`

Query Parameters:
- `stage` - Filter by startup stage
- `industry` - Filter by industry
- `page` - Pagination page

Response (200):
```json
[
  {
    "_id": "idea_id",
    "title": "AI Chat App",
    "description": "...",
    "industry": "Technology",
    "stage": "MVP",
    "fundingGoal": 500000,
    "equityOffered": 25
  }
]
```

### 2. Create Startup Idea
**POST** `/startups` (Protected)

Request:
```json
{
  "title": "AI Chat Application",
  "description": "An AI-powered...",
  "industry": "Technology",
  "stage": "MVP",
  "fundingGoal": 500000,
  "equityOffered": 25,
  "skillsNeeded": ["AI/ML", "Frontend", "Backend"]
}
```

Response (201):
```json
{
  "message": "Startup idea created",
  "idea": { ... }
}
```

### 3. Get Idea Details
**GET** `/startups/:ideaId`

### 4. Update Idea
**PUT** `/startups/:ideaId` (Protected)

### 5. Express Interest
**POST** `/startups/:ideaId/interest` (Protected)

Response (200):
```json
{
  "message": "Interest expressed"
}
```

---

## Payment Endpoints

### 1. Get Subscription Plans
**GET** `/payments/plans`

Response (200):
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "features": ["Limited profiles", "Basic messaging"]
    },
    {
      "id": "premium",
      "name": "Premium",
      "price": 9.99,
      "features": ["Unlimited messaging", "Priority matching"]
    }
  ]
}
```

### 2. Create Payment Intent
**POST** `/payments/create-intent` (Protected)

Request:
```json
{
  "planId": "premium",
  "amount": 999
}
```

Response (200):
```json
{
  "clientSecret": "pi_stripe_secret"
}
```

### 3. Confirm Payment
**POST** `/payments/confirm` (Protected)

Request:
```json
{
  "paymentIntentId": "pi_xxx"
}
```

Response (200):
```json
{
  "message": "Payment confirmed"
}
```

---

## Admin Endpoints

### 1. Get Dashboard Stats
**GET** `/admin/dashboard` (Protected & Admin)

Response (200):
```json
{
  "stats": {
    "totalUsers": 10000,
    "activeUsers": 7500,
    "totalMatches": 5000,
    "totalRevenue": 125000
  }
}
```

### 2. Get All Users
**GET** `/admin/users` (Protected & Admin)

### 3. Block User
**POST** `/admin/users/:userId/block` (Protected & Admin)

### 4. Verify User
**POST** `/admin/users/:userId/verify` (Protected & Admin)

---

## Error Codes

| Code | Message |
|------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - No/invalid token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Server Error - Internal error |

## Rate Limiting

- 100 requests per 15 minutes per IP for public endpoints
- 1000 requests per 15 minutes per user for authenticated endpoints

---

Last Updated: January 2024
