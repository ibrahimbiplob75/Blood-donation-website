const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
// const { verifyAdmin } = require('../services/authService');
const { 
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getBlood,
  updateBlood,
  deleteBlood,
  getDashboardStats,
  getDonorHistory,
  getStatistics,
  updateStatistics,
} = require('../controllers/adminController');


router.get('/admin/users', verifyAdmin, getAdminUsers);
router.post('/admin/users', verifyAdmin, createAdminUser);
router.put('/admin/users/:id', verifyAdmin, updateAdminUser);
router.delete('/admin/users/:id', verifyAdmin, deleteAdminUser);
router.get("/admin/bloods/:id", verifyAdmin, getBlood);
router.put("/admin/bloods/:id", verifyAdmin, updateBlood);
router.delete("/admin/bloods/:id", verifyAdmin, deleteBlood);

router.get('/admin/dashboard-stats', verifyAdmin, getDashboardStats);
router.get('/admin/donor-history', verifyAdmin, getDonorHistory);

// Statistics routes
router.get('/admin/statistics', verifyAdmin, getStatistics);
router.put('/admin/statistics', verifyAdmin, updateStatistics);

module.exports = router;
