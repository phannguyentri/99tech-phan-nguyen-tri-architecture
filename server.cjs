// Load environment variables
const dotenv = require('dotenv');
dotenv.config();

// Import dependencies
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', apiLimiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import User model
const User = require('./models/User');

// Import routes
const authRoutes = require('./routes/auth');
const scoreRoutes = require('./routes/scores');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Score Tracking API' });
});

// Socket.IO implementation
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Send current leaderboard on connection
  emitLeaderboard(socket);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Global socket reference for broadcasting from API routes
global.io = io;

// Helper function to emit leaderboard data
async function emitLeaderboard(socket) {
  try {
    const leaderboard = await getLeaderboardFromDB();
    if (socket) {
      // Emit to specific socket
      socket.emit('leaderboard', leaderboard);
    } else {
      // Broadcast to all connected clients
      io.emit('leaderboard', leaderboard);
    }
  } catch (error) {
    console.error('Error emitting leaderboard:', error);
  }
}

// Helper function to get leaderboard data from DB
async function getLeaderboardFromDB() {
  try {
    return await User.getLeaderboard(10);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Export for testing
module.exports = { app, server, io, emitLeaderboard }; 