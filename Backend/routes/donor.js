const express = require('express');
const router = express.Router();
const {
  registerDonor,
  getDonorProfile,
  updateDonorProfile,
  getAllDonors,
  searchDonors,
} = require('../controllers/donorController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerDonor);
// router.get('/profile',  getDonorProfile);
router.get('/all', protect, authorize('admin', 'hospital'), getAllDonors);
router.post('/search', protect, searchDonors);

module.exports = router;
