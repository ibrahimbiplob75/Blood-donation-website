const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/database');

/**
 * Create new donation request (when user wants to donate)
 */
const createDonationRequest = async (req, res) => {
  try {
    const {
      bloodGroup,
      donorName,
      donorPhone,
      donorAddress,
      donorEmail,
      dateOfBirth,
      weight,
      district,
      lastDonationDate,
      medicalConditions,
      availability,
      notes,
      units = 1
    } = req.body;

    // Validation
    if (!bloodGroup || !donorName || !donorPhone) {
      return res.status(400).json({
        success: false,
        message: 'Blood group, donor name, and phone are required'
      });
    }

    const { donationRequestsCollection } = getCollections();

    const newRequest = {
      bloodGroup: bloodGroup.trim(),
      units: parseInt(units) || 1,
      donorName: donorName.trim(),
      donorPhone: donorPhone.trim(),
      donorAddress: donorAddress || '',
      donorEmail: donorEmail ? donorEmail.trim().toLowerCase() : '',
      dateOfBirth: dateOfBirth || null,
      weight: weight ? parseInt(weight) : null,
      district: district || '',
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
      medicalConditions: medicalConditions || 'None',
      availability: availability || 'Available',
      notes: notes || '',
      approvalStatus: 'pending', // pending, approved, rejected
      status: 'pending', // pending, completed, cancelled
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedBy: null,
      approvedAt: null,
      addedToStockAt: null,
      transactionId: null
    };

    const result = await donationRequestsCollection.insertOne(newRequest);

    const createdRequest = await donationRequestsCollection.findOne({
      _id: result.insertedId
    });

    res.status(201).json({
      success: true,
      message: 'Donation request submitted successfully. Waiting for admin approval.',
      request: createdRequest
    });
  } catch (error) {
    console.error('Create donation request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create donation request',
      error: error.message
    });
  }
};

/**
 * Get all donation requests with optional filters
 */
const getDonationRequests = async (req, res) => {
  try {
    const { bloodGroup, district, approvalStatus, status } = req.query;

    const { donationRequestsCollection } = getCollections();

    // Build query
    let query = {};
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (district) query.district = district;
    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (status) query.status = status;

    const requests = await donationRequestsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: requests.length,
      requests: requests
    });
  } catch (error) {
    console.error('Get donation requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation requests',
      error: error.message
    });
  }
};

/**
 * Get pending donation requests for admin approval
 */
const getPendingDonationRequests = async (req, res) => {
  try {
    const { donationRequestsCollection } = getCollections();

    const pendingRequests = await donationRequestsCollection
      .find({ approvalStatus: 'pending' })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: pendingRequests.length,
      requests: pendingRequests
    });
  } catch (error) {
    console.error('Get pending donation requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending donation requests',
      error: error.message
    });
  }
};

/**
 * Get single donation request by ID
 */
const getDonationRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
    }

    const { donationRequestsCollection } = getCollections();
    const request = await donationRequestsCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Donation request not found'
      });
    }

    res.status(200).json({
      success: true,
      request: request
    });
  } catch (error) {
    console.error('Get donation request by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation request',
      error: error.message
    });
  }
};

/**
 * Approve donation request and add to blood stock (Admin only)
 */
const approveDonationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, adminEmail } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
    }

    const {
      donationRequestsCollection,
      bloodStockCollection,
      bloodTransactionsCollection
    } = getCollections();

    // Get the donation request
    const donationRequest = await donationRequestsCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!donationRequest) {
      return res.status(404).json({
        success: false,
        message: 'Donation request not found'
      });
    }

    if (donationRequest.approvalStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Donation request already approved'
      });
    }

    // Add to blood stock
    const stockUpdate = await bloodStockCollection.findOneAndUpdate(
      { bloodGroup: donationRequest.bloodGroup },
      {
        $inc: { units: donationRequest.units },
        $set: {
          lastUpdated: new Date(),
          updatedBy: adminEmail || adminId || 'admin'
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Record transaction
    const transaction = await bloodTransactionsCollection.insertOne({
      type: 'entry',
      bloodGroup: donationRequest.bloodGroup,
      units: donationRequest.units,
      donorName: donationRequest.donorName,
      donorPhone: donationRequest.donorPhone,
      donorAddress: donationRequest.donorAddress,
      donorEmail: donationRequest.donorEmail,
      dateOfBirth: donationRequest.dateOfBirth,
      weight: donationRequest.weight,
      district: donationRequest.district,
      lastDonationDate: donationRequest.lastDonationDate,
      medicalConditions: donationRequest.medicalConditions,
      availability: donationRequest.availability,
      notes: donationRequest.notes,
      donatedAt: new Date(),
      collectedBy: adminEmail || adminId || 'admin',
      previousStock: stockUpdate.value
        ? stockUpdate.value.units - donationRequest.units
        : 0,
      newStock: stockUpdate.value ? stockUpdate.value.units : donationRequest.units,
      status: 'completed',
      donationRequestId: id
    });

    // Update donation request
    await donationRequestsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          approvalStatus: 'approved',
          status: 'completed',
          approvedBy: adminEmail || adminId,
          approvedAt: new Date(),
          addedToStockAt: new Date(),
          transactionId: transaction.insertedId,
          updatedAt: new Date()
        }
      }
    );

    const updatedRequest = await donationRequestsCollection.findOne({
      _id: new ObjectId(id)
    });

    res.status(200).json({
      success: true,
      message: `Donation approved! ${donationRequest.units} unit(s) of ${donationRequest.bloodGroup} added to stock`,
      request: updatedRequest,
      newStock: stockUpdate.value ? stockUpdate.value.units : donationRequest.units,
      transactionId: transaction.insertedId
    });
  } catch (error) {
    console.error('Approve donation request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve donation request',
      error: error.message
    });
  }
};

/**
 * Reject donation request (Admin only)
 */
const rejectDonationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, adminId, adminEmail } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
    }

    const { donationRequestsCollection } = getCollections();

    const result = await donationRequestsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          approvalStatus: 'rejected',
          status: 'cancelled',
          rejectionReason: reason || '',
          rejectedBy: adminId || adminEmail,
          rejectedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donation request not found'
      });
    }

    const updatedRequest = await donationRequestsCollection.findOne({
      _id: new ObjectId(id)
    });

    res.status(200).json({
      success: true,
      message: 'Donation request rejected',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Reject donation request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject donation request',
      error: error.message
    });
  }
};

/**
 * Delete donation request (Admin only)
 */
const deleteDonationRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
    }

    const { donationRequestsCollection } = getCollections();
    const result = await donationRequestsCollection.deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donation request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donation request deleted successfully'
    });
  } catch (error) {
    console.error('Delete donation request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete donation request',
      error: error.message
    });
  }
};

module.exports = {
  createDonationRequest,
  getDonationRequests,
  getPendingDonationRequests,
  getDonationRequestById,
  approveDonationRequest,
  rejectDonationRequest,
  deleteDonationRequest
};
