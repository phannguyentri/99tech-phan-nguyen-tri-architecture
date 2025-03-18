const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Verifies JWT token from cookies
 * Adds userId to request object if token is valid
 */
module.exports = (req, res, next) => {
  try {
    // Get token from cookies instead of Authorization header
    const token = req.cookies.access_token;
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No authentication token provided' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request
    req.userId = decoded.userId;
    
    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Handle different types of errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired, please login again' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    // Generic error response
    res.status(401).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
}; 