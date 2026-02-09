// Authentication Service
// Handles user and admin authentication

const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/database');
const jwt = require('jsonwebtoken');
const { blacklistToken, isTokenBlacklisted } = require('./tokenBlacklistService');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Generate JWT Token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
};

/**
 * Verify JWT Token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { usersCollection } = getCollections();
    const user = await usersCollection.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'No password set for this account. Please contact admin.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isAdminRole = ['admin', 'moderator', 'Admin', 'Moderator', 'executive', 'Executive'].includes(user.role);

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      admin: isAdminRole
    });

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 8 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      authenticated: true,
      token: token,
      user: {
        _id: user._id,
        name: user.Name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Admin Logout - Clear cookie and token
 */
const logoutAdmin = async (req, res) => {
  try {
    // Extract token from cookie or header
    let token = req.cookies?.adminToken;
    
    if (!token && req.headers?.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }
    
    // Blacklist the token if it exists
    if (token) {
      try {
        const decoded = verifyToken(token);
        if (decoded && decoded.userId) {
          // Calculate token expiry from JWT
          const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 8 * 60 * 60 * 1000);
          
          // Blacklist the token
          await blacklistToken(token, decoded.userId, expiresAt);
        }
      } catch (error) {
        console.error('Error blacklisting token on logout:', error);
      }
    }
    
    // Clear cookie with all possible configurations
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });

    // Also clear any other potential admin-related cookies
    res.clearCookie('Admin-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

/**
 * Verify Admin Token - Check cookie validity
 */
const verifyAdminToken = async (req, res) => {
  try {
    let token = req.cookies?.adminToken;
    
    // If no cookie, try Authorization header
    if (!token && req.headers?.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    // Check if token is blacklisted first
    if (token && await isTokenBlacklisted(token)) {
      return res.status(200).json({ authenticated: false, reason: 'Token revoked' });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(200).json({ authenticated: false });
    }

    const { usersCollection } = getCollections();
    const user = await usersCollection.findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(200).json({ authenticated: false });
    }

    res.status(200).json({
      authenticated: true,
      user: {
        _id: user._id,
        name: user.Name,
        email: user.email,
        role: user.role,
        subrole: user.subrole || '',
        bloodGroup: user.bloodGroup || null,
        phone: user.phone || null
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(200).json({ authenticated: false });
  }
};

/**
 * Verify Authenticated User Middleware
 * Requires valid token but user doesn't need to be admin
 */
const verifyAuthenticated = async (req, res, next) => {
  try {
    let token = null;
    if (req && req.cookies && req.cookies.token) token = req.cookies.token;
    if (req && req.cookies && req.cookies.adminToken) token = req.cookies.adminToken;
    if (!token && req.headers && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') token = parts[1];
    }
    if (!token && req.query && req.query.token) token = req.query.token;

    if (!token) {
      console.warn('verifyAuthenticated: no token provided');
      return res.status(403).json({ error: 'Access denied - no token' });
    }

    // Check if token is blacklisted
    if (await isTokenBlacklisted(token)) {
      console.warn('verifyAuthenticated: token is blacklisted');
      return res.status(403).json({ error: 'Access denied - token revoked' });
    }

    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      return next();
    }

    console.warn('verifyAuthenticated: token invalid');
    return res.status(403).json({ error: 'Access denied - invalid token' });
  } catch (err) {
    console.error('verifyAuthenticated error:', err);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Verify Admin Middleware
 */
const verifyAdmin = async (req, res, next) => {
  try {
    let token = null;
    if (req && req.cookies && req.cookies.adminToken) token = req.cookies.adminToken;
    if (!token && req.headers && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') token = parts[1];
    }
    if (!token && req.query && req.query.token) token = req.query.token;

    if (!token) {
      console.warn('verifyAdmin (service): no token provided');
      return res.status(403).json({ error: 'Access denied - no token' });
    }

    // Check if token is blacklisted
    if (await isTokenBlacklisted(token)) {
      console.warn('verifyAdmin (service): token is blacklisted');
      return res.status(403).json({ error: 'Access denied - token revoked' });
    }

    const decoded = verifyToken(token);
    if (decoded && decoded.admin) {
      req.admin = decoded;
      return next();
    }

    console.warn('verifyAdmin (service): token invalid or not admin');
    return res.status(403).json({ error: 'Access denied - invalid token' });
  } catch (err) {
    console.error('verifyAdmin (service) error:', err);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  loginAdmin,
  logoutAdmin,
  verifyAdminToken,
  verifyAuthenticated,
  verifyAdmin
};
