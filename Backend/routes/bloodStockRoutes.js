const express = require('express');
const router = express.Router();
const { 
  getBloodStock, 
  bloodEntry, 
  bloodDonate, 
  bloodExchange, 
  getBloodTransactions,
  getTransactionStats,
  getAllBloodStock,
  getBloodStockByUserGroup,
  updateBloodTransaction,
  deleteBloodTransaction,
  checkUserByPhone,
  createDonationHistory,
  getDonationHistoryList,
  updateDonationStatus,
  getAvailableBloodBags,
  markBloodAsUsed,
  getDonorBloodTracking
} = require('../controllers/bloodStockController');
const { verifyAdmin } = require('../middleware/auth');

// Admin routes (protected)
router.get('/admin/blood-stock', verifyAdmin, getBloodStock);
router.post('/admin/blood-entry', bloodEntry);
router.post('/admin/blood-donate', bloodDonate);
router.post('/admin/blood-exchange', verifyAdmin, bloodExchange);
router.get('/admin/blood-transactions', verifyAdmin, getBloodTransactions);
router.get('/admin/transaction-stats', verifyAdmin, getTransactionStats);
router.put('/admin/blood-transactions/:id', verifyAdmin, updateBloodTransaction);
router.delete('/admin/blood-transactions/:id', verifyAdmin, deleteBloodTransaction);
router.post('/admin/check-user-by-phone', verifyAdmin, checkUserByPhone);
router.post('/admin/donation-history', verifyAdmin, createDonationHistory);
router.get('/admin/donation-history-list', verifyAdmin, getDonationHistoryList);
router.put('/admin/donation-status/:id', verifyAdmin, updateDonationStatus);
router.get('/admin/available-blood-bags', verifyAdmin, getAvailableBloodBags);
router.post('/admin/mark-blood-as-used', verifyAdmin, markBloodAsUsed);

// Public routes (can be accessed by users)
router.get('/admin/all-blood-stock', getAllBloodStock);
router.get('/admin/blood-stock-by-group', getBloodStockByUserGroup);
router.get('/donor/blood-tracking/:userId', getDonorBloodTracking);

module.exports = router;