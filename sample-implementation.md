# Sample Implementation Code Examples

This document contains code examples for the key components of the score tracking system using Node.js.

## Server Setup (Express + Socket.IO)

```javascript
// server.js - Main server file
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const scoreRoutes = require('./routes/scores');

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
app.use(cors());
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', apiLimiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

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

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

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

// Export for use in other modules
module.exports = { app, server, emitLeaderboard };
```

## User Model

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
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
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
```

## Authentication Routes

```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: 'User with that email or username already exists'
      });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      userId: user._id
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Update last activity
    user.lastActivity = Date.now();
    await user.save();
    
    res.json({
      message: 'Login successful',
      token,
      userId: user._id,
      username: user.username
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
```

## Score Routes with Authentication Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// routes/scores.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { emitLeaderboard } = require('../server');

// Get leaderboard (top 10 scores)
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .sort({ score: -1 })
      .limit(10)
      .select('username score -_id');
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
});

// Get specific user's score
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('username score -_id');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user score error:', error);
    res.status(500).json({ message: 'Server error fetching user score' });
  }
});

// Update user score (requires authentication)
router.post('/update', auth, async (req, res) => {
  try {
    const { scoreChange } = req.body;
    
    // Validate score change
    if (typeof scoreChange !== 'number' || scoreChange <= 0) {
      return res.status(400).json({ message: 'Invalid score change value' });
    }
    
    // Get user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update score
    user.score += scoreChange;
    user.lastActivity = Date.now();
    await user.save();
    
    // Emit updated leaderboard to all connected clients
    emitLeaderboard();
    
    res.json({
      message: 'Score updated successfully',
      newScore: user.score
    });
    
  } catch (error) {
    console.error('Update score error:', error);
    res.status(500).json({ message: 'Server error updating score' });
  }
});

module.exports = router;
```

## Frontend Integration Example

```javascript
// Example React component for score updates and WebSocket integration

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

// API configuration
const API_URL = 'http://localhost:3000/api';
const socket = io(API_URL);

const ScoreBoard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userScore, setUserScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get token from localStorage
  const token = localStorage.getItem('authToken');
  
  // Configure axios with authorization header
  const authAxios = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  // Fetch initial leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/scores/leaderboard`);
        setLeaderboard(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch leaderboard');
        setLoading(false);
        console.error('Leaderboard fetch error:', err);
      }
    };
    
    fetchLeaderboard();
    
    // Set up WebSocket listener for real-time updates
    socket.on('leaderboard', (data) => {
      setLeaderboard(data);
    });
    
    // Cleanup on unmount
    return () => {
      socket.off('leaderboard');
    };
  }, []);
  
  // Function to perform an action that increases score
  const performAction = async () => {
    try {
      // This would be triggered by a game action, button click, etc.
      const scoreChange = 10; // Example score value
      
      const response = await authAxios.post('/scores/update', { scoreChange });
      setUserScore(response.data.newScore);
      
      // The leaderboard will update automatically via WebSocket
    } catch (err) {
      setError('Failed to update score');
      console.error('Score update error:', err);
    }
  };
  
  if (loading) return <div>Loading leaderboard...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="scoreboard-container">
      <h2>Top 10 Players</h2>
      <ul className="leaderboard">
        {leaderboard.map((user, index) => (
          <li key={index} className="leaderboard-item">
            <span className="rank">{index + 1}</span>
            <span className="username">{user.username}</span>
            <span className="score">{user.score}</span>
          </li>
        ))}
      </ul>
      
      {token && (
        <div className="user-actions">
          <p>Your current score: {userScore}</p>
          <button onClick={performAction}>Perform Action (+10 points)</button>
        </div>
      )}
    </div>
  );
};

export default ScoreBoard;
```

## Dockerfile for Containerization

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose the port the app will run on
EXPOSE 3000

# Define environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV MONGODB_URI=mongodb://mongodb:27017/scoreboard
ENV JWT_SECRET=your-jwt-secret-should-be-in-env-vars
ENV FRONTEND_URL=http://localhost:3000

# Start the application
CMD ["node", "server.js"]
```

## Docker Compose for Local Development

```yaml
version: '3'

services:
  # MongoDB service
  mongodb:
    image: mongo:latest
    container_name: mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

  # Node.js application
  api:
    build: .
    container_name: score-api
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
    environment:
      - NODE_ENV=development
      - PORT=3000
      - MONGODB_URI=mongodb://mongodb:27017/scoreboard
      - JWT_SECRET=development-secret-key
      - FRONTEND_URL=http://localhost:3000
    volumes:
      - .:/app
      - /app/node_modules
    networks:
      - app-network
    command: npm run dev

networks:
  app-network:
    driver: bridge

volumes:
  mongodb_data:
``` 