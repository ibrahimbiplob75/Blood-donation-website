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
router.get('/public-stats', getDonorStats); // Public endpoint for public donor statistics
router.get('/stats', getDonorStats); // Public endpoint for statistics
// router.get('/profile',  getDonorProfile);
router.get('/all', getAllDonors); // Also keep /all endpoint public for now
router.post('/search', searchDonors);

module.exports = router;
