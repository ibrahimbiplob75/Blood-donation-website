const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  deleteFirebaseUser,
  getUserProfile,
  updateUserProfile,
  getDonationHistory,
  getRequestHistory,
  getPendingDonors,
  approveDonor,
  rejectDonor
} = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');


router.get('/profile',  getUserProfile);
router.put('/profile',  updateUserProfile);
router.get('/donation-history', getDonationHistory);
router.get('/request-history', getRequestHistory);

router.post('/users', createUser);
router.get('/users', getUsers);
router.put('/users/:id',verifyAdmin, updateUser);
router.delete('/users/:id', verifyAdmin, deleteUser);
router.post('/delete-firebase-user', verifyAdmin, deleteFirebaseUser);

// Donor approval routes (admin only)
router.get('/users/admin/pending-donors', verifyAdmin, getPendingDonors);
router.put('/users/:id/approve-donor', verifyAdmin, approveDonor);
router.put('/users/:id/reject-donor', verifyAdmin, rejectDonor);

module.exports = router;