const BloodRequest = require('../models/BloodRequest');
const { sendEmail } = require('../services/emailService');

// @desc    Create blood request
// @route   POST /api/request
// @access  Private
exports.createRequest = async (req, res) => {
  try {
    const { patientName, bloodGroup, unitsRequired, urgency, hospital, requiredDate, contactNumber, additionalInfo } = req.body;

    const request = await BloodRequest.create({
      requestedBy: req.user.id,
      patientName,
      bloodGroup,
      unitsRequired,
      urgency,
      hospital,
      requiredDate,
      contactNumber,
      additionalInfo,
    });

    // Send notification emails
    // await sendEmail({...});

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all blood requests
// @route   GET /api/request
// @access  Private
exports.getAllRequests = async (req, res) => {
  try {
    const { status, bloodGroup, urgency } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (urgency) query.urgency = urgency;

    const requests = await BloodRequest.find(query)
      .populate('requestedBy', 'name email phone')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single blood request
// @route   GET /api/request/:id
// @access  Private
exports.getRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requestedBy', 'name email phone')
      .populate('fulfilledBy');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update blood request status
// @route   PUT /api/request/:id
// @access  Private/Admin
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, fulfilledBy, rejectionReason } = req.body;

    let request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    if (status === 'fulfilled') {
      request.fulfilledBy = fulfilledBy;
      request.fulfilledDate = Date.now();
    }
    if (status === 'rejected') {
      request.rejectionReason = rejectionReason;
    }

    await request.save();

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete blood request
// @route   DELETE /api/request/:id
// @access  Private
exports.deleteRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is the one who created the request or is admin
    if (request.requestedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await request.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Request deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
