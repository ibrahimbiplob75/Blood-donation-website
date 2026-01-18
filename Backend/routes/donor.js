const express = require('express');
const router = express.Router();
const {
  registerDonor,
  getDonorProfile,
  updateDonorProfile,
  getAllDonors,
  searchDonors,
  getDonorStats,
} = require('../controllers/donorController');

router.post('/register', registerDonor);
router.get('/public-stats', getDonorStats);
router.get('/stats', getDonorStats);
router.get('/all', getAllDonors);
router.post('/search', searchDonors);

module.exports = router;
