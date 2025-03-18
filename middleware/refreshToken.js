const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Refresh token middleware
 * Verifies refresh token from cookies
 * Issues new access token if refresh token is valid
 */
module.exports = async (req, res, next) => {
  try {
    // Check if refresh token exists in cookies
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Find user with matching refresh token
    const user = await User.findOne({ 
      _id: decoded.userId,
      refreshToken: refreshToken 
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    // Set new access token as httpOnly cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes in milliseconds
    });

    // Add user to request
    req.userId = user._id;
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      score: user.score
    };

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Refresh token middleware error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Refresh token expired, please login again'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
}; 