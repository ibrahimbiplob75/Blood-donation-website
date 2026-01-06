const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../services/authService');
const {
  createDonationRequest,
  getDonationRequests,
  getPendingDonationRequests,
  getDonationRequestById,
  approveDonationRequest,
  rejectDonationRequest,
  deleteDonationRequest
} = require('../controllers/donationRequestController');

// Public routes
router.post('/donation-requests', createDonationRequest);
router.get('/donation-requests', getDonationRequests);
router.get('/donation-requests/:id', getDonationRequestById);

// Admin only routes
router.get('/donation-requests/admin/pending', verifyAdmin, getPendingDonationRequests);
router.put('/donation-requests/:id/approve', verifyAdmin, approveDonationRequest);
router.put('/donation-requests/:id/reject', verifyAdmin, rejectDonationRequest);
router.delete('/donation-requests/:id', verifyAdmin, deleteDonationRequest);

module.exports = router;
