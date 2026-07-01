# Setup Guide - Cofounder Matrimony

## Prerequisites

### Required Software
- Node.js v16.0.0 or higher
- npm v7.0.0 or higher
- MongoDB v4.4 or higher
- Redis v6.0 or higher
- Git

### Optional
- Docker & Docker Compose
- AWS Account (for S3)
- Firebase Account (for file storage)
- Stripe Account (for payments)

---

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/cofounder-matrimony.git
cd cofounder-matrimony
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Required fields:
# - MONGODB_URI
# - JWT_SECRET
# - EMAIL_USER and EMAIL_PASS
# - STRIPE_SECRET_KEY
# - FRONTEND_URL

# Start backend server
npm run dev    # Development mode
npm start      # Production mode
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your API URLs

# Start frontend development server
npm start
```

---

## Docker Setup

### Using Docker Compose

```bash
docker-compose up -d
```

This will start:
- MongoDB
- Redis
- Backend Server
- Frontend Server

Check `docker-compose.yml` for port configurations.

---

## Database Setup

### MongoDB Setup

#### Local MongoDB
```bash
# Install MongoDB Community Edition
# macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community

# Linux (Ubuntu)
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Windows
# Download from https://www.mongodb.com/try/download/community
```

#### MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Get connection string
4. Add to `.env` as `MONGODB_URI`

### Initialize Database

```bash
cd backend

# Option 1: Manual import (if seed data provided)
mongoimport --uri "your_mongodb_uri" --collection users --file database/seed-data.json

# Option 2: Automatic migration (if migrations exist)
npm run migrate
```

### Create Indexes

```bash
# Connect to MongoDB
mongo your_mongodb_uri

# Run index commands from documentation
```

---

## Redis Setup

### Local Redis

```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Linux (Ubuntu)
sudo apt-get install redis-server
sudo systemctl start redis-server

# Windows
# Download from https://github.com/microsoftarchive/redis/releases
```

### Test Redis Connection

```bash
redis-cli ping
# Should return: PONG
```

---

## Environment Configuration

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db-name
MONGODB_TEST_URI=mongodb://localhost:27017/test-db

# Authentication
JWT_SECRET=your_very_secret_key_change_this
JWT_EXPIRE=7d

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_PUBLIC_KEY=pk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# Storage (AWS S3)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=us-east-1

# Frontend
FRONTEND_URL=http://localhost:3000

# Redis
REDIS_URL=redis://localhost:6379
```

### Frontend (.env.local)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Firebase
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Stripe
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxxx

# Agora (Video Call)
REACT_APP_AGORA_APP_ID=your_agora_id

# OAuth
REACT_APP_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
REACT_APP_LINKEDIN_CLIENT_ID=your_linkedin_id
```

---

## Third-Party Services Setup

### 1. Stripe

1. Go to https://dashboard.stripe.com
2. Create account
3. Get API keys from Developers > API Keys
4. Add to backend `.env`
5. Set webhook endpoint in dashboard

### 2. Firebase

1. Go to https://console.firebase.google.com
2. Create new project
3. Enable Authentication and Storage
4. Download service account key
5. Add credentials to backend
6. Add config to frontend

### 3. Google OAuth

1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs
4. Add credentials to frontend `.env`

### 4. Agora (Video Call)

1. Sign up at https://www.agora.io
2. Get App ID from project
3. Add to frontend `.env`

---

## Running the Application

### Development Mode

Terminal 1 (Backend):
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

### Production Mode

```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd ../backend
NODE_ENV=production npm start

# Serve frontend (using Vercel or similar)
```

---

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Run with coverage
npm test -- --coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Solution:
- Check MONGODB_URI in .env
- Ensure MongoDB is running
- Check firewall/network access
- Verify credentials
```

**JWT Authentication Error**
```
Solution:
- Clear localStorage in browser
- Check JWT_SECRET in .env (both frontend & backend)
- Verify token expiration
- Re-login
```

**CORS Error**
```
Solution:
- Check FRONTEND_URL in backend .env
- Verify CORS configuration in server.js
- Check browser console for detailed error
```

**Socket.io Connection Error**
```
Solution:
- Check REACT_APP_SOCKET_URL in frontend
- Verify Socket.io is initialized on backend
- Check firewall/proxy settings
```

**Email Not Sending**
```
Solution:
- Verify EMAIL_USER and EMAIL_PASS
- Enable "Less secure app access" for Gmail
- Check email service status
- Review error logs
```

### Debug Mode

Set in `.env`:
```env
NODE_ENV=development
DEBUG=*
LOG_LEVEL=debug
```

---

## Performance Optimization

### Backend Optimization
```javascript
// Use caching
const redis = require('redis');
const cache = redis.createClient();

// Implement pagination
router.get('/users?page=1&limit=20');

// Use aggregation pipeline for complex queries
db.collection.aggregate([...])
```

### Frontend Optimization
```javascript
// Code splitting
const Profile = React.lazy(() => import('./pages/Profile'));

// Image optimization
<img src={optimizedImage} alt="description" />

// Memoization
const MemoComponent = React.memo(Component);
```

---

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS in production
- [ ] Enable firewall rules
- [ ] Set up rate limiting
- [ ] Enable 2FA for admin
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable CORS restrictions
- [ ] Implement input validation

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure database
3. ✅ Set up environment variables
4. ✅ Start development servers
5. ✅ Test API endpoints
6. ✅ Deploy to production

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/cofounder-matrimony/issues
- Email: support@cofoundersmatrimony.com

---

Last Updated: January 2024
