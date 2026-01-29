/**
 * Token Blacklist Service
 * Manages revoked/blacklisted tokens to prevent reuse after logout
 */

const { getCollections } = require('../config/database');

// In-memory cache for recently blacklisted tokens (for performance)
const blacklistCache = new Map();
const CACHE_TTL = 8 * 60 * 60 * 1000; // 8 hours (match token expiry)

/**
 * Add a token to the blacklist
 * @param {string} token - JWT token to blacklist
 * @param {string} userId - User ID associated with the token
 * @param {Date} expiresAt - When the token expires
 */
const blacklistToken = async (token, userId, expiresAt = null) => {
  try {
    const { blacklistedTokensCollection } = getCollections();
    
    // Default expiry if not provided (8 hours from now)
    const tokenExpiry = expiresAt || new Date(Date.now() + CACHE_TTL);
    
    // Add to database
    await blacklistedTokensCollection.insertOne({
      token: token,
      userId: userId,
      blacklistedAt: new Date(),
      expiresAt: tokenExpiry
    });
    
    // Add to in-memory cache
    blacklistCache.set(token, {
      userId,
      blacklistedAt: new Date(),
      expiresAt: tokenExpiry
    });
    
    return true;
  } catch (error) {
    console.error('Error blacklisting token:', error);
    // Still add to cache even if database fails
    blacklistCache.set(token, {
      userId,
      blacklistedAt: new Date(),
      expiresAt: expiresAt || new Date(Date.now() + CACHE_TTL)
    });
    return false;
  }
};

/**
 * Check if a token is blacklisted
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if token is blacklisted
 */
const isTokenBlacklisted = async (token) => {
  if (!token) return false;
  
  // Check in-memory cache first (faster)
  if (blacklistCache.has(token)) {
    const cached = blacklistCache.get(token);
    // Check if cache entry is expired
    if (cached.expiresAt > new Date()) {
      return true;
    } else {
      // Remove expired entry from cache
      blacklistCache.delete(token);
    }
  }
  
  // Check database
  try {
    const { blacklistedTokensCollection } = getCollections();
    const blacklisted = await blacklistedTokensCollection.findOne({
      token: token,
      expiresAt: { $gt: new Date() } // Only check non-expired entries
    });
    
    if (blacklisted) {
      // Add to cache for faster future lookups
      blacklistCache.set(token, {
        userId: blacklisted.userId,
        blacklistedAt: blacklisted.blacklistedAt,
        expiresAt: blacklisted.expiresAt
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    // In case of database error, deny access to be safe
    return false;
  }
};

/**
 * Blacklist all tokens for a specific user
 * Useful when user changes password or security settings
 * @param {string} userId - User ID
 */
const blacklistAllUserTokens = async (userId) => {
  try {
    const { blacklistedTokensCollection } = getCollections();
    
    // Mark all existing tokens for this user as blacklisted
    await blacklistedTokensCollection.insertOne({
      userId: userId,
      allTokens: true, // Special flag to indicate all tokens
      blacklistedAt: new Date(),
      expiresAt: new Date(Date.now() + CACHE_TTL)
    });
    
    return true;
  } catch (error) {
    console.error('Error blacklisting all user tokens:', error);
    return false;
  }
};

/**
 * Clean up expired blacklist entries
 * Should be run periodically (e.g., daily via cron job)
 */
const cleanupExpiredTokens = async () => {
  try {
    const { blacklistedTokensCollection } = getCollections();
    
    // Remove expired entries from database
    const result = await blacklistedTokensCollection.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    // Clean up in-memory cache
    const now = new Date();
    for (const [token, data] of blacklistCache.entries()) {
      if (data.expiresAt < now) {
        blacklistCache.delete(token);
      }
    }
    
    console.log(`Cleaned up ${result.deletedCount} expired blacklisted tokens`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    return 0;
  }
};

/**
 * Initialize blacklist service
 * Sets up periodic cleanup
 */
const initializeBlacklistService = () => {
  // Clean up expired tokens every hour
  setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
  
  console.log('Token blacklist service initialized');
};

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
  blacklistAllUserTokens,
  cleanupExpiredTokens,
  initializeBlacklistService
};
