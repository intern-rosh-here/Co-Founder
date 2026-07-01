# Cofounder Matrimony Platform

A cutting-edge web platform connecting entrepreneurs and business professionals to find their perfect co-founders.

## 🚀 Features

### Core Features
- **User Registration & Authentication** - Email/SMS verification, OAuth (Google, LinkedIn)
- **Profile Management** - Detailed founder profiles with skills, experience, and preferences
- **Smart Matching** - AI-powered compatibility algorithm matching co-founders
- **Real-time Messaging** - Socket.io powered instant messaging
- **Startup Ideas Marketplace** - Post and discover startup ideas
- **Connection Management** - Send, accept, or reject partnership requests

### Advanced Features
- **Video Calling** - Integrated Agora video call support
- **Payment Integration** - Stripe for subscription management
- **Skill Verification** - Third-party skill verification and badges
- **Advanced Search** - Filter by industry, experience, location, skills
- **Analytics Dashboard** - Track profile views, connections, and matches
- **Admin Panel** - Comprehensive platform management tools
- **Mobile Responsive** - Fully responsive design for all devices

## 🛠 Tech Stack

### Frontend
- React.js 18.2
- Redux Toolkit for state management
- Tailwind CSS for styling
- Socket.io Client for real-time features
- Formik & Yup for form validation
- Axios for API calls

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time communication
- Stripe for payments
- Firebase for file storage
- Redis for caching

### Deployment
- Frontend: Vercel
- Backend: AWS/Heroku
- Database: MongoDB Atlas
- Storage: AWS S3/Firebase

## 📁 Project Structure

```
cofounder-matrimony/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── store/              # Redux store & slices
│   │   ├── services/           # API services
│   │   ├── hooks/              # Custom hooks
│   │   ├── App.js             # Main app component
│   │   └── index.js           # Entry point
│   ├── package.json
│   └── .env.example
│
├── backend/                     # Express server
│   ├── server.js               # Main server file
│   ├── models/                 # MongoDB schemas
│   ├── controllers/            # Business logic
│   ├── routes/                 # API routes
│   ├── middleware/             # Express middleware
│   ├── services/               # External services
│   ├── config/                 # Configuration files
│   ├── package.json
│   └── .env.example
│
├── database/                    # Database schemas & docs
│   ├── schema.md               # Database schema
│   ├── seed-data.json          # Sample data
│   └── migrations/             # Migration scripts
│
├── documentation/              # Project documentation
│   ├── API-DOCS.md            # API documentation
│   ├── SETUP.md               # Setup guide
│   ├── ARCHITECTURE.md        # System architecture
│   └── USER-GUIDE.md          # User guide

└── config/                      # Configuration files
    ├── docker-compose.yml
    ├── nginx.conf
    └── environment templates
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Redis 6+
- Git

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm start
```

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Environment Variables

Frontend (.env.local):
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_key
```

Backend (.env):
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/db
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_secret_key
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Profile Endpoints
- `GET /api/profiles/:userId` - Get user profile
- `PUT /api/profiles/update` - Update profile
- `POST /api/profiles/upload-image` - Upload profile image
- `GET /api/profiles/search/results` - Search profiles

### Match Endpoints
- `GET /api/matches/recommendations` - Get recommendations
- `GET /api/matches` - Get matches
- `POST /api/matches/save/:profileId` - Save profile
- `POST /api/matches/connect/:profileId` - Send connection

### Message Endpoints
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:conversationId` - Get messages
- `POST /api/messages/:conversationId/send` - Send message

### Payment Endpoints
- `GET /api/payments/plans` - Get subscription plans
- `POST /api/payments/create-intent` - Create payment
- `POST /api/payments/confirm` - Confirm payment

## 🗄 Database Schema

### Key Collections
- **users** - User accounts and profiles
- **matches** - Matching records and compatibility
- **conversations** - Message conversations
- **messages** - Individual messages
- **startup_ideas** - Startup ideas marketplace
- **subscriptions** - User subscriptions

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- CORS configuration
- Rate limiting
- Input validation & sanitization
- SQL injection protection
- XSS protection
- HTTPS enforced in production

## 📊 Key Metrics

- **User Growth**: Track new registrations
- **Match Rate**: Monitor successful matches
- **Engagement**: Message frequency and login patterns
- **Retention**: User activity and churn rate
- **Revenue**: Subscription and payment metrics

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (AWS/Heroku)
```bash
git push heroku main
heroku logs --tail
```

## 📝 Contributing

1. Clone the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE.md

## 🤝 Support

For support, email support@cofoundersmatrimony.com

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] AI chat bot for recommendations
- [ ] Equity calculator tool
- [ ] Legal document templates
- [ ] Investor connections
- [ ] Accelerator partnerships
- [ ] Success stories marketplace

---

Built with ❤️ by the Cofounder Matrimony Team
