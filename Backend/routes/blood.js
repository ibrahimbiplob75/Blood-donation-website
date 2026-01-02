const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { 
  uploadDonars
} = require('../controllers/bloodController');

router.post('/upload-blood-donors', verifyAdmin, upload.single('file'), uploadDonars);

module.exports = router;