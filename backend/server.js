const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path'); 
const socketIO = require('socket.io');
require('dotenv').config();

const matchesRoutes = require('./routes/matches');
const app = express();
const server = http.createServer(app);

// ============================================
// CORS Configuration for Express
// ============================================
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
    ];
    
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS middleware to Express
app.use(cors(corsOptions));

// ============================================
// Socket.IO Configuration with CORS
// ============================================
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// Make io accessible globally for controllers
global.io = io;

// ============================================
// Middleware
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// MongoDB Connection
// ============================================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB connected');
  })
  .catch((err) => {
    console.error('✗ MongoDB Connection Error:', err.message);
  });

// ============================================
// Routes
// ============================================
// Auth Routes
app.use('/api/auth', require('./routes/auth'));

// Profile Routes
app.use('/api/profiles', require('./routes/profiles'));

// Match Routes
app.use('/api/matches', require('./routes/matches'));

// Message Routes
app.use('/api/messages', require('./routes/messages'));



// Payment Routes
app.use('/api/payments', require('./routes/payments'));

// Admin Routes
app.use('/api/admin', require('./routes/admin'));

// OAuth Routes (ADD THIS LINE)
app.use('/api/auth/oauth', require('./routes/oauth'));
// Add with other routes
app.use('/api/profiles', require('./routes/profiles'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/matches', matchesRoutes);


// Connection Routes
app.use('/api/connections', require('./routes/connections'));

// Like Routes
app.use('/api/likes', require('./routes/likes'));

// Notification Routes
app.use('/api/notifications', require('./routes/notifications'));

app.use('/api/community', require('./routes/community'));
app.use('/api/ideas', require('./routes/ideas'));

// ============================================
// Health Check Endpoint
// ============================================
app.get('/', (req, res) => {
  res.json({
    message: 'Cofounder Matrimony API is running!',
    status: 'OK',
  });
});
const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);
// ============================================
// Socket.IO Configuration
// ============================================
io.on('connection', (socket) => {
  console.log(`✅ New user connected: ${socket.id}`);

  socket.on('user_online', (userId) => {
    console.log(`👤 User online: ${userId}`);
    socket.join(`user_${userId}`);
  });

  socket.on('join_conversation', (conversationId) => {
    console.log(`📢 User joined room: conversation_${conversationId}`);
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    console.log(`👋 User left room: conversation_${conversationId}`);
    socket.leave(`conversation_${conversationId}`);
  });

  socket.on('send_message', (messageData) => {
    console.log(`💬 Broadcasting message to room: conversation_${messageData.conversationId}`);
    io.to(`conversation_${messageData.conversationId}`).emit('message_received', messageData);
  });

  socket.on('typing', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
      userId: socket.id,
      isTyping: data.isTyping,
    });
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// ============================================
// Error Handling Middleware
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);
  console.log(`✓ API: http://localhost:${PORT}/api`);
});

// ============================================
// Graceful Shutdown
// ============================================
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
