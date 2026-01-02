const express = require('express');
const router = express.Router();
const {
  getAllStock,
  getStockByBloodGroup,
  updateStock,
  getLowStock,
} = require('../controllers/stockController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAllStock);
router.get('/low', protect, authorize('admin'), getLowStock);
router.get('/:bloodGroup', protect, getStockByBloodGroup);
router.put('/:bloodGroup', protect, authorize('admin'), updateStock);

module.exports = router;
