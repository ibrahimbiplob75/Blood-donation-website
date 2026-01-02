const express = require('express');
const router = express.Router();
const {
  generateUserJWT,
  loginAdmin,
  logoutAdmin,
  verifyAdminToken,
  getCSRFToken
} = require('../services/authService');

// User Authentication (Firebase-based)
router.post('/jwt', generateUserJWT);

// Admin Authentication (Database-based with password)
router.post('/admin/login', loginAdmin);
router.post('/admin/logout', logoutAdmin);
router.get('/admin/verify-token', verifyAdminToken);

// CSRF Token
router.get('/csrf-token', getCSRFToken);

module.exports = router;
