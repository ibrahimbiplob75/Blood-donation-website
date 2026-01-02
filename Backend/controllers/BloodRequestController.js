const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/database');

/**
 * Create new blood request
 */
const createBloodRequest = async (req, res) => {
  try {
    const {
      bloodGroup,
      hospitalName,
      hospitalLocation,
      district,
      contactNumber,
      reason,
      urgency,
      requesterName,
      requesterEmail,
    } = req.body;

    // Validation
    if (!bloodGroup || !hospitalName || !hospitalLocation || !district || !contactNumber || !reason || !urgency) {
      return res.status(400).json({ 
        message: 'All fields are required' 
      });
    }

    const { bloodRequestsCollection } = getCollections();

    const newRequest = {
      bloodGroup: bloodGroup.trim(),
      hospitalName: hospitalName.trim(),
      hospitalLocation: hospitalLocation.trim(),
      district: district.trim(),
      contactNumber: contactNumber.trim(),
      reason: reason.trim(),
      urgency: urgency,
      requesterName: requesterName ? requesterName.trim() : '',
      requesterEmail: requesterEmail ? requesterEmail.trim().toLowerCase() : '',
      status: 'pending', // pending, fulfilled, cancelled
      createdAt: new Date(),
      updatedAt: new Date(),
      fulfilledAt: null,
      fulfilledBy: null,
    };

    const result = await bloodRequestsCollection.insertOne(newRequest);
    
    const createdRequest = await bloodRequestsCollection.findOne(
      { _id: result.insertedId }
    );

    res.status(201).json({
      message: 'Blood request created successfully',
      request: createdRequest
    });
  } catch (error) {
    console.error('Create blood request error:', error);
    res.status(500).json({
      message: 'Failed to create blood request',
      error: error.message
    });
  }
};

/**
 * Get all blood requests with optional filters
 */
const getBloodRequests = async (req, res) => {
  try {
    const { bloodGroup, district, status, urgency } = req.query;
    
    const { bloodRequestsCollection } = getCollections();

    // Build query
    let query = {};
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (district) query.district = district;
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;

    const requests = await bloodRequestsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (error) {
    console.error('Get blood requests error:', error);
    res.status(500).json({
      message: 'Failed to fetch blood requests',
      error: error.message
    });
  }
};

/**
 * Get single blood request by ID
 */
const getBloodRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }

    const { bloodRequestsCollection } = getCollections();
    const request = await bloodRequestsCollection.findOne({ 
      _id: new ObjectId(id) 
    });

    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    res.status(200).json(request);
  } catch (error) {
    console.error('Get blood request by ID error:', error);
    res.status(500).json({
      message: 'Failed to fetch blood request',
      error: error.message
    });
  }
};

/**
 * Update blood request status
 */
const updateBloodRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, fulfilledBy, donorName, donorPhone } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }

    if (!['pending', 'active', 'fulfilled', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const { bloodRequestsCollection } = getCollections();

    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status === 'active' && donorName && donorPhone) {
      updateData.donorName = donorName;
      updateData.donorPhone = donorPhone;
    }

    if (status === 'fulfilled') {
      updateData.fulfilledAt = new Date();
      if (fulfilledBy) {
        updateData.fulfilledBy = fulfilledBy;
      }
    }

    const result = await bloodRequestsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    const updatedRequest = await bloodRequestsCollection.findOne({
      _id: new ObjectId(id)
    });

    res.status(200).json({
      message: 'Blood request status updated successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Update blood request status error:', error);
    res.status(500).json({
      message: 'Failed to update blood request status',
      error: error.message
    });
  }
};

/**
 * Delete blood request
 */
const deleteBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }

    const { bloodRequestsCollection } = getCollections();
    const result = await bloodRequestsCollection.deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    res.status(200).json({
      message: 'Blood request deleted successfully',
      id: id
    });
  } catch (error) {
    console.error('Delete blood request error:', error);
    res.status(500).json({
      message: 'Failed to delete blood request',
      error: error.message
    });
  }
};

/**
 * Get blood requests by user email
 */
const getMyBloodRequests = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const { bloodRequestsCollection } = getCollections();
    const requests = await bloodRequestsCollection
      .find({ requesterEmail: email.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(requests);
  } catch (error) {
    console.error('Get my blood requests error:', error);
    res.status(500).json({
      message: 'Failed to fetch your blood requests',
      error: error.message
    });
  }
};

/**
 * Get blood request statistics
 */
const getBloodRequestStats = async (req, res) => {
  try {
    const { bloodRequestsCollection } = getCollections();

    const [
      totalRequests,
      pendingRequests,
      fulfilledRequests,
      cancelledRequests,
      requestsByBloodGroup,
      requestsByUrgency,
      recentRequests
    ] = await Promise.all([
      bloodRequestsCollection.countDocuments(),
      bloodRequestsCollection.countDocuments({ status: 'pending' }),
      bloodRequestsCollection.countDocuments({ status: 'fulfilled' }),
      bloodRequestsCollection.countDocuments({ status: 'cancelled' }),
      bloodRequestsCollection.aggregate([
        {
          $group: {
            _id: '$bloodGroup',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray(),
      bloodRequestsCollection.aggregate([
        {
          $group: {
            _id: '$urgency',
            count: { $sum: 1 }
          }
        }
      ]).toArray(),
      bloodRequestsCollection
        .find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray()
    ]);

    res.status(200).json({
      success: true,
      totalRequests,
      pendingRequests,
      fulfilledRequests,
      cancelledRequests,
      requestsByBloodGroup: requestsByBloodGroup.map(item => ({
        bloodGroup: item._id,
        count: item.count
      })),
      requestsByUrgency: requestsByUrgency.map(item => ({
        urgency: item._id,
        count: item.count
      })),
      recentRequests
    });
  } catch (error) {
    console.error('Get blood request stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch blood request statistics',
      error: error.message
    });
  }
};

module.exports = {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequestStatus,
  deleteBloodRequest,
  getMyBloodRequests,
  getBloodRequestStats
};