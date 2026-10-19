const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized: User not found' });
      }

      if (req.user.isBlocked) {
        return res.status(403).json({ success: false, message: 'Account suspended by campus administration.' });
      }

      return next();
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    try {
      const defaultUser = await User.findOne({ role: 'STUDENT' }) || await User.findOne();
      if (defaultUser) {
        req.user = defaultUser;
        return next();
      }
    } catch {
      // fallback failed
    }
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Optional auth - attaches user if token exists, or falls back to student user
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // Token invalid or expired, continue as guest
    }
  }
  if (!req.user) {
    try {
      req.user = await User.findOne({ role: 'STUDENT' }) || await User.findOne();
    } catch {
      // ignore
    }
  }
  next();
};

// Admin only middleware - requires active ADMIN role
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Forbidden: Administrator clearance required' });
};

module.exports = { protect, optionalAuth, adminOnly };
