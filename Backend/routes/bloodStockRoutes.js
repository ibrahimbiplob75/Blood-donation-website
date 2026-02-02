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
  deleteBloodTransaction
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

// Public routes (can be accessed by users)
router.get('/admin/all-blood-stock', getAllBloodStock);
router.get('/admin/blood-stock-by-group', getBloodStockByUserGroup);

module.exports = router;