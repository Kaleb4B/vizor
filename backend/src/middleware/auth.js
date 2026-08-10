'use strict';

const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No authentication token provided', 401);
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError('Invalid or expired token', 401));
  }
}

function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || 
                 req.headers['x-site-id'] || 
                 req.body?.site_id || 
                 (req.body?.events && req.body.events[0]?.site_id) || 
                 'site-001';
  req.apiKey = apiKey;
  next();
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Not authenticated', 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}

module.exports = { generateToken, verifyToken, authenticate, authenticateApiKey, authorize };
