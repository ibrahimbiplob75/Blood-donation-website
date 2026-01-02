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
  getRequestHistory
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

module.exports = router;