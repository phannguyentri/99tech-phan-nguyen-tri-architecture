const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/scores/leaderboard
 * @desc    Get top 10 scores
 * @access  Public
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await User.getLeaderboard(10);
    
    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching leaderboard' 
    });
  }
});

/**
 * @route   GET /api/scores/user/:userId
 * @desc    Get specific user's score
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('username score -_id');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user score error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching user score' 
    });
  }
});

/**
 * @route   POST /api/scores/update
 * @desc    Update user score
 * @access  Private
 */
router.post('/update', auth, async (req, res) => {
  try {
    const { scoreChange } = req.body;
    
    // Validate score change
    if (typeof scoreChange !== 'number' || scoreChange <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid score change value' 
      });
    }
    
    // Get user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Update score
    user.score += scoreChange;
    user.lastActivity = Date.now();
    await user.save();
    
    // Get updated leaderboard
    const leaderboard = await User.getLeaderboard(10);
    
    // Emit updated leaderboard to all connected clients
    if (global.io) {
      global.io.emit('leaderboard', leaderboard);
    }
    
    res.json({
      success: true,
      message: 'Score updated successfully',
      newScore: user.score,
      leaderboard
    });
    
  } catch (error) {
    console.error('Update score error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating score' 
    });
  }
});

module.exports = router; 