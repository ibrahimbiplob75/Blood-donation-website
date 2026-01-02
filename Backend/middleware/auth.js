const jwt = require('jsonwebtoken');
const { getCollections } = require('../config/database');
const constants = require('../utils/constants');
const {  ObjectId } = require('mongodb');

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

    console.log('verifyAdmin - token found:', !!token);

    if (!token) {
      console.warn('verifyAdmin: no token provided');
      return res.status(403).json({ error: 'Access denied - no token' });
    }

    const decoded = verifyToken(token);
    console.log('verifyAdmin - decoded:', decoded);
    
    if (decoded && decoded.admin) {
      req.admin = decoded;
      return next();
    }

    console.warn('verifyAdmin: token invalid or not admin');
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
