const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  logoutAdmin,
  verifyAdminToken,
  getCSRFToken
} = require('../services/authService');

// Authentication (Database-based with password)
router.post('/login', loginAdmin);
router.post('/admin/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.post('/admin/logout', logoutAdmin);
router.get('/verify-token', verifyAdminToken);
router.get('/admin/verify-token', verifyAdminToken);

// CSRF Token
router.get('/csrf-token', getCSRFToken);

module.exports = router;
