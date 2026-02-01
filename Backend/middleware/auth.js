const jwt = require('jsonwebtoken');
const { getCollections } = require('../config/database');
const constants = require('../utils/constants');
const {  ObjectId } = require('mongodb');
const { isTokenBlacklisted } = require('../services/tokenBlacklistService');

const generateToken = (payload) => {
  return jwt.sign(payload, constants.JWT_SECRET, { expiresIn: 60 * 60 * 8 });
};
const verifyToken = (token) => {
  try {
    return jwt.verify(token, constants.JWT_SECRET);
  } catch (err) {
    return null;
  }
};
const verifyAdmin = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies?.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token && req.headers?.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    // Then query param
    if (!token && req.query?.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(403).json({ error: 'Access denied - no token' });
    }

    // Check if token has been blacklisted (logged out)
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    const decoded = verifyToken(token);

    if (decoded && decoded.admin) {
      req.admin = decoded;
      return next();
    }

    return res.status(403).json({ error: 'Access denied - invalid token' });
  } catch (err) {
    console.error('verifyAdmin error:', err);
    return res.status(500).json({ error: 'Authentication error' });
  }
};


module.exports = {
  generateToken,
  verifyToken,
  verifyAdmin,
};
