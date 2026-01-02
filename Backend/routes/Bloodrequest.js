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
  getBloodRequestStats
} = require('../controllers/BloodRequestController');

router.post('/blood-requests', createBloodRequest);
router.get('/blood-requests', getBloodRequests);
router.get('/blood-requests/my-requests', getMyBloodRequests);
router.get('/blood-requests/stats', getBloodRequestStats);
router.get('/blood-requests/:id', getBloodRequestById);

// Protected routes (admin only)
router.put('/blood-requests/:id/status', verifyAdmin, updateBloodRequestStatus);
router.delete('/blood-requests/:id', verifyAdmin, deleteBloodRequest);

module.exports = router;
