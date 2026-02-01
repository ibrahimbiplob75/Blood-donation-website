const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/database');

/**
 * Create new blood request
 */
const createBloodRequest = async (req, res) => {
  try {
    const {
      name,
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

    const { bloodRequestsCollection, usersCollection } = getCollections();

    const newRequest = {
      name: name ? name.trim() : '',
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
      approvalStatus: 'pending', // pending, approved, rejected - for admin approval
      createdAt: new Date(),
      updatedAt: new Date(),
      fulfilledAt: null,
      fulfilledBy: null,
      approvedBy: null,
      approvedAt: null,
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
    const { bloodGroup, district, status, urgency, includeUnapproved } = req.query;
    
    const { bloodRequestsCollection, usersCollection } = getCollections();

    // Build query
    let query = {};
    
    // Only show approved requests to public unless explicitly requested otherwise
    if (includeUnapproved !== 'true') {
      query.approvalStatus = 'approved';
    }
    
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

    const { bloodRequestsCollection, usersCollection } = getCollections();

    const existing = await bloodRequestsCollection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

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
      if (!existing.countersUpdated) {
        updateData.countersUpdated = true;
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

    // If transitioning to fulfilled (and not previously counted), bump counters
    if (status === 'fulfilled' && existing.status !== 'fulfilled' && !existing.countersUpdated) {
      if (existing.requesterEmail) {
        await usersCollection.updateOne(
          { email: existing.requesterEmail },
          { $inc: { bloodTaken: 1 }, $set: { updatedAt: new Date() } }
        );
      }

      if (fulfilledBy) {
        await usersCollection.updateOne(
          { email: fulfilledBy },
          { $inc: { bloodGiven: 1 }, $set: { updatedAt: new Date() } }
        );
      }
    }

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
    const result = await bloodRequestsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    res.status(200).json({
      message: 'Blood request deleted successfully',
      id
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

/**
 * Get pending blood requests for admin approval
 */
const getPendingBloodRequests = async (req, res) => {
  try {
    const { bloodRequestsCollection } = getCollections();

    const pendingRequests = await bloodRequestsCollection
      .find({ approvalStatus: 'pending' })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: pendingRequests.length,
      requests: pendingRequests
    });
  } catch (error) {
    console.error('Get pending blood requests error:', error);
    res.status(500).json({
      message: 'Failed to fetch pending blood requests',
      error: error.message
    });
  }
};

/**
 * Approve blood request (Admin only)
 */
const approveBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, adminEmail } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }

    const { bloodRequestsCollection } = getCollections();

    const result = await bloodRequestsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          approvalStatus: 'approved',
          approvedBy: adminId || adminEmail,
          approvedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    const updatedRequest = await bloodRequestsCollection.findOne({
      _id: new ObjectId(id)
    });

    res.status(200).json({
      message: 'Blood request approved successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Approve blood request error:', error);
    res.status(500).json({
      message: 'Failed to approve blood request',
      error: error.message
    });
  }
};

/**
 * Reject blood request (Admin only)
 */
const rejectBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, adminId, adminEmail } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }

    const { bloodRequestsCollection } = getCollections();

    const result = await bloodRequestsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          approvalStatus: 'rejected',
          rejectionReason: reason || '',
          rejectedBy: adminId || adminEmail,
          rejectedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    const updatedRequest = await bloodRequestsCollection.findOne({
      _id: new ObjectId(id)
    });

    res.status(200).json({
      message: 'Blood request rejected',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Reject blood request error:', error);
    res.status(500).json({
      message: 'Failed to reject blood request',
      error: error.message
    });
  }
};

/**
 * Donate from blood bank stock to fulfill request (Admin only)
 */
const donateFromBloodBank = async (req, res) => {
  try {
    const { id } = req.params;
    const { units, adminEmail, adminName } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }

    if (!units || units <= 0) {
      return res.status(400).json({ message: 'Valid units required' });
    }

    const { bloodRequestsCollection, bloodStockCollection, bloodTransactionsCollection, usersCollection } = getCollections();

    // Get the blood request
    const request = await bloodRequestsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    // Check stock availability
    const stockDoc = await bloodStockCollection.findOne({ bloodGroup: request.bloodGroup });
    const currentStock = stockDoc ? stockDoc.units : 0;

    if (currentStock < units) {
      return res.status(400).json({ 
        message: `Insufficient stock. Only ${currentStock} unit(s) available`,
        availableUnits: currentStock
      });
    }

    // Update stock
    await bloodStockCollection.updateOne(
      { bloodGroup: request.bloodGroup },
      { 
        $inc: { units: -parseInt(units) },
        $set: { 
          lastUpdated: new Date(),
          updatedBy: adminEmail || 'admin'
        }
      }
    );

    // Record transaction
    await bloodTransactionsCollection.insertOne({
      type: 'donation',
      bloodGroup: request.bloodGroup,
      units: parseInt(units),
      receiverName: request.requesterName,
      receiverPhone: request.contactNumber,
      hospitalName: request.hospitalName,
      requestId: request._id.toString(),
      donatedAt: new Date(),
      donatedBy: 'Blood Bank',
      processedBy: adminEmail || adminName || 'admin',
      previousStock: currentStock,
      newStock: currentStock - parseInt(units),
      status: 'completed',
      notes: `Blood bank donation for request: ${request.reason}`
    });

    // Update blood request status
    await bloodRequestsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: 'fulfilled',
          fulfilledBy: 'Blood Bank',
          fulfilledAt: new Date(),
          donorName: 'Blood Bank Stock',
          donorPhone: 'N/A',
          unitsProvided: parseInt(units),
          updatedAt: new Date(),
          countersUpdated: true
        } 
      }
    );

    const updatedRequest = await bloodRequestsCollection.findOne({
      _id: new ObjectId(id)
    });

    // Increment requester bloodTaken when fulfilled via blood bank
    if (updatedRequest?.requesterEmail) {
      await usersCollection.updateOne(
        { email: updatedRequest.requesterEmail },
        { $inc: { bloodTaken: 1 }, $set: { updatedAt: new Date() } }
      );
    }

    res.status(200).json({
      message: 'Blood donated from blood bank successfully',
      request: updatedRequest,
      unitsRemaining: currentStock - parseInt(units)
    });
  } catch (error) {
    console.error('Donate from blood bank error:', error);
    res.status(500).json({
      message: 'Failed to donate from blood bank',
      error: error.message
    });
  }
};

/**
 * Donate blood to a request (user donation)
 * Regular users can donate to blood requests
 */
const donateToBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { donorName, donorPhone, fulfilledBy } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }

    if (!donorName || !donorPhone) {
      return res.status(400).json({ message: 'Donor name and phone are required' });
    }

    const { bloodRequestsCollection, bloodTransactionsCollection, usersCollection } = getCollections();

    // Check if request exists and is pending
    const request = await bloodRequestsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is no longer pending' });
    }

    // Update request status to active with donor info
    const result = await bloodRequestsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: 'active',
          donorName: donorName,
          donorPhone: donorPhone,
          fulfilledBy: fulfilledBy || 'user',
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Record the transaction
    await bloodTransactionsCollection.insertOne({
      type: 'donation',
      bloodGroup: request.bloodGroup,
      units: 1,
      donorName: donorName,
      donorPhone: donorPhone,
      receiverName: request.requesterName,
      hospitalName: request.hospitalName,
      requestId: request._id.toString(),
      donatedAt: new Date(),
      donatedBy: fulfilledBy || 'user',
      status: 'completed',
      notes: `User donation for: ${request.reason}`
    });

    const updatedRequest = await bloodRequestsCollection.findOne({
      _id: new ObjectId(id)
    });

    // Update donor and requester counters immediately for direct donations
    if (updatedRequest?.requesterEmail) {
      await usersCollection.updateOne(
        { email: updatedRequest.requesterEmail },
        { $inc: { bloodTaken: 1 }, $set: { updatedAt: new Date() } }
      );
    }

    if (fulfilledBy) {
      await usersCollection.updateOne(
        { email: fulfilledBy },
        { $inc: { bloodGiven: 1 }, $set: { updatedAt: new Date() } }
      );
    }

    // Mark to avoid double counting when status later moves to fulfilled
    await bloodRequestsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { countersUpdated: true } }
    );

    res.status(200).json({
      message: 'Thank you for your donation!',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Donate to blood request error:', error);
    res.status(500).json({
      message: 'Failed to register donation',
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
  getBloodRequestStats,
  getPendingBloodRequests,
  approveBloodRequest,
  rejectBloodRequest,
  donateFromBloodBank,
  donateToBloodRequest
};