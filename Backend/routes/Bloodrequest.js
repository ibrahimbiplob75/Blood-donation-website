const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../services/authService');
const {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequestStatus,
  deleteBloodRequest,
  getMyBloodRequests,
  getBloodRequestStats,
  getPendingBloodRequests,
  approveBloodRequest,
  rejectBloodRequest,
  donateFromBloodBank
} = require('../controllers/BloodRequestController');

router.post('/blood-requests', createBloodRequest);
router.get('/blood-requests', getBloodRequests);
router.get('/blood-requests/my-requests', getMyBloodRequests);
router.get('/blood-requests/stats', getBloodRequestStats);
router.get('/blood-requests/:id', getBloodRequestById);

// Protected routes (admin only)
router.get('/blood-requests/admin/pending', verifyAdmin, getPendingBloodRequests);
router.put('/blood-requests/:id/approve', verifyAdmin, approveBloodRequest);
router.put('/blood-requests/:id/reject', verifyAdmin, rejectBloodRequest);
router.put('/blood-requests/:id/status', verifyAdmin, updateBloodRequestStatus);
router.put('/blood-requests/:id/donate-from-bank', verifyAdmin, donateFromBloodBank);
router.delete('/blood-requests/:id', verifyAdmin, deleteBloodRequest);

module.exports = router;
