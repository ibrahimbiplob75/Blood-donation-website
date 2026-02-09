const { getCollections } = require('../config/database');
const { ObjectId } = require('mongodb');
const { BLOOD_GROUPS } = require('../utils/constants');

// Get current blood stock
const getBloodStock = async (req, res) => {
  try {
    const { bloodStockCollection } = getCollections();
    
    const stock = {};
    
    for (const group of BLOOD_GROUPS) {
      const stockDoc = await bloodStockCollection.findOne({ bloodGroup: group });
      stock[group] = stockDoc ? stockDoc.units : 0;
    }
    
    res.json({
      success: true,
      stock
    });
  } catch (error) {
    console.error('Get blood stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood stock',
      error: error.message
    });
  }
};

// Blood entry (add to stock)
const bloodEntry = async (req, res) => {
  try {
    const { 
      bloodGroup, 
      units, 
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
      bloodBagNumber,
      notes 
    } = req.body;
    
    const { bloodStockCollection, bloodTransactionsCollection, donationHistoryCollection } = getCollections();
    
    if (!bloodGroup || !units || !donorName) {
      return res.status(400).json({
        success: false,
        message: 'Blood group, units, and donor name are required'
      });
    }
    
    // Update stock
    const stockUpdate = await bloodStockCollection.findOneAndUpdate(
      { bloodGroup },
      { 
        $inc: { units: parseInt(units) },
        $set: { 
          lastUpdated: new Date(),
          updatedBy: req.admin?.phone || req.admin?.email || 'system'
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    
    // Record transaction with complete donor details
    const transaction = await bloodTransactionsCollection.insertOne({
      type: 'entry',
      bloodGroup,
      units: parseInt(units),
      donorName,
      donorPhone: donorPhone || '',
      donorAddress: donorAddress || '',
      donorEmail: donorEmail || '',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      weight: weight || null,
      district: district || '',
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
      medicalConditions: medicalConditions || 'None',
      availability: availability || 'Available',
      bloodBagNumber: bloodBagNumber || '',
      notes: notes || '',
      donatedAt: new Date(),
      collectedBy: req.admin?.phone || req.admin?.email || 'system',
      previousStock: stockUpdate.value ? stockUpdate.value.units - parseInt(units) : 0,
      newStock: stockUpdate.value ? stockUpdate.value.units : parseInt(units),
      status: 'completed'
    });

    // Also create a donation history record for bag selection during donation
    await donationHistoryCollection.insertOne({
      bloodBagNumber: bloodBagNumber || `BAG-${Date.now()}`,
      bloodGroup,
      donorName,
      donorPhone: donorPhone || '',
      units: parseInt(units),
      donationDate: new Date(),
      status: 'available',
      isRegisteredUser: false,
      donorAddress: donorAddress || '',
      notes: notes || '',
      createdAt: new Date()
    });
    
    res.json({
      success: true,
      message: `${units} unit(s) of ${bloodGroup} added to stock with Bag #: ${bloodBagNumber || 'N/A'}`,
      transactionId: transaction.insertedId,
      newStock: stockUpdate.value ? stockUpdate.value.units : parseInt(units)
    });
  } catch (error) {
    console.error('Blood entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add blood to stock',
      error: error.message
    });
  }
};

// Blood donation (remove from stock)
const bloodDonate = async (req, res) => {
  try {
    const { 
      bloodGroup, 
      units, 
      receiverName, 
      receiverPhone, 
      hospitalName,
      patientId,
      neededDate, 
      notes 
    } = req.body;
    
    const { bloodStockCollection, bloodTransactionsCollection } = getCollections();
    
    if (!bloodGroup || !units || !receiverName || !hospitalName) {
      return res.status(400).json({
        success: false,
        message: 'Blood group, units, receiver name, and hospital are required'
      });
    }
    
    const stockDoc = await bloodStockCollection.findOne({ bloodGroup });
    const currentStock = stockDoc ? stockDoc.units : 0;
    
    if (currentStock < parseInt(units)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${currentStock} unit(s) available`
      });
    }
    
    // Update stock
    const stockUpdate = await bloodStockCollection.findOneAndUpdate(
      { bloodGroup },
      { 
        $inc: { units: -parseInt(units) },
        $set: { 
          lastUpdated: new Date(),
          updatedBy: req.admin?.phone || req.admin?.email || 'system'
        }
      },
      { returnDocument: 'after' }
    );
    
    // Record transaction
    const transaction = await bloodTransactionsCollection.insertOne({
      type: 'donate',
      bloodGroup,
      units: parseInt(units),
      receiverName,
      receiverPhone: receiverPhone || '',
      hospitalName,
      patientId: patientId || '',
      neededDate: neededDate ? new Date(neededDate) : null,
      notes: notes || '',
      createdAt: new Date(),
      createdBy: req.admin?.phone || req.admin?.email || 'system',
      previousStock: currentStock,
      newStock: stockUpdate.value ? stockUpdate.value.units : 0,
      status: 'completed'
    });
    
    res.json({
      success: true,
      message: `${units} unit(s) of ${bloodGroup} donated successfully`,
      transactionId: transaction.insertedId,
      remainingStock: stockUpdate.value ? stockUpdate.value.units : 0
    });
  } catch (error) {
    console.error('Blood donate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to donate blood',
      error: error.message
    });
  }
};

// Blood exchange (between blood groups)
const bloodExchange = async (req, res) => {
  try {
    const { 
      fromBloodGroup, 
      toBloodGroup, 
      units, 
      hospitalName, 
      patientId,
      neededDate,
      notes 
    } = req.body;
    
    const { bloodStockCollection, bloodTransactionsCollection } = getCollections();
    
    if (!fromBloodGroup || !toBloodGroup || !units || !hospitalName) {
      return res.status(400).json({
        success: false,
        message: 'Both blood groups, units, and hospital are required'
      });
    }
    
    if (fromBloodGroup === toBloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Cannot exchange same blood group'
      });
    }
    
    // Check stock availability
    const fromStockDoc = await bloodStockCollection.findOne({ bloodGroup: fromBloodGroup });
    const toStockDoc = await bloodStockCollection.findOne({ bloodGroup: toBloodGroup });
    
    const fromCurrentStock = fromStockDoc ? fromStockDoc.units : 0;
    const toCurrentStock = toStockDoc ? toStockDoc.units : 0;
    
    if (fromCurrentStock < parseInt(units)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock of ${fromBloodGroup}. Only ${fromCurrentStock} unit(s) available`
      });
    }
    
    // Update both stocks
    const fromStockUpdate = await bloodStockCollection.findOneAndUpdate(
      { bloodGroup: fromBloodGroup },
      { 
        $inc: { units: -parseInt(units) },
        $set: { 
          lastUpdated: new Date(),
          updatedBy: req.admin?.phone || req.admin?.email || 'system'
        }
      },
      { returnDocument: 'after' }
    );
    
    const toStockUpdate = await bloodStockCollection.findOneAndUpdate(
      { bloodGroup: toBloodGroup },
      { 
        $inc: { units: parseInt(units) },
        $set: { 
          lastUpdated: new Date(),
          updatedBy: req.admin?.phone || req.admin?.email || 'system'
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    
    // Record transaction
    const transaction = await bloodTransactionsCollection.insertOne({
      type: 'exchange',
      fromBloodGroup,
      toBloodGroup,
      units: parseInt(units),
      hospitalName,
      patientId: patientId || '',
      neededDate: neededDate ? new Date(neededDate) : null,
      notes: notes || '',
      createdAt: new Date(),
      createdBy: req.admin?.phone || req.admin?.email || 'system',
      fromPreviousStock: fromCurrentStock,
      fromNewStock: fromStockUpdate.value ? fromStockUpdate.value.units : 0,
      toPreviousStock: toCurrentStock,
      toNewStock: toStockUpdate.value ? toStockUpdate.value.units : 0,
      status: 'completed'
    });
    
    res.json({
      success: true,
      message: `${units} unit(s) exchanged: ${fromBloodGroup} → ${toBloodGroup}`,
      transactionId: transaction.insertedId,
      fromStock: fromStockUpdate.value ? fromStockUpdate.value.units : 0,
      toStock: toStockUpdate.value ? toStockUpdate.value.units : 0
    });
  } catch (error) {
    console.error('Blood exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to exchange blood',
      error: error.message
    });
  }
};

// Get transaction history with filters
const getBloodTransactions = async (req, res) => {
  try {
    const { bloodTransactionsCollection } = getCollections();
    const { type, bloodGroup, startDate, endDate, limit = 100 } = req.query;
    
    const query = {};
    
    if (type) query.type = type;
    if (bloodGroup) {
      query.$or = [
        { bloodGroup },
        { fromBloodGroup: bloodGroup },
        { toBloodGroup: bloodGroup }
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const transactions = await bloodTransactionsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({
      success: true,
      transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

// Get transaction statistics
const getTransactionStats = async (req, res) => {
  try {
    const { bloodTransactionsCollection } = getCollections();
    
    const stats = await bloodTransactionsCollection.aggregate([
      {
        $facet: {
          totalByType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalUnits: { $sum: '$units' }
              }
            }
          ],
          totalByBloodGroup: [
            {
              $match: { type: { $in: ['entry', 'donate'] } }
            },
            {
              $group: {
                _id: '$bloodGroup',
                entries: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'entry'] }, '$units', 0]
                  }
                },
                donations: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'donate'] }, '$units', 0]
                  }
                }
              }
            }
          ],
          recentTransactions: [
            { $sort: { createdAt: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]).toArray();
    
    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Get all blood stock with details
const getAllBloodStock = async (req, res) => {
  try {
    const { bloodStockCollection } = getCollections();
    const stocks = await bloodStockCollection.find().sort({ bloodGroup: 1 }).toArray();
    
    // Convert array to object with blood groups as keys
    const stockObj = {};
    
    for (const group of BLOOD_GROUPS) {
      const stockDoc = stocks.find(s => s.bloodGroup === group);
      stockObj[group] = stockDoc ? stockDoc.units : 0;
    }
    
    res.json({
      success: true,
      stock: stockObj,
      stocks: stocks // Keep original array for backward compatibility
    });
  } catch (error) {
    console.error('Get all stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood stock',
      error: error.message
    });
  }
};

// Get blood stock by blood group
const getBloodStockByUserGroup = async (req, res) => {
  try {
    const { bloodStockCollection } = getCollections();
    const { bloodGroup } = req.query;
    
    if (!bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Blood group is required'
      });
    }
    
    const stock = await bloodStockCollection.findOne({ bloodGroup });
    
    res.json({
      success: true,
      stock: stock || { bloodGroup, units: 0, lastUpdated: new Date() }
    });
  } catch (error) {
    console.error('Get stock by group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood stock',
      error: error.message
    });
  }
};

// Update blood transaction
const updateBloodTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { units, donorName, donorPhone, receiverName, receiverPhone, hospitalName, patientId, notes } = req.body;
    
    const { bloodTransactionsCollection, bloodStockCollection } = getCollections();
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }
    
    // Get existing transaction
    const existingTransaction = await bloodTransactionsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    const oldUnits = existingTransaction.units;
    const newUnits = parseInt(units);
    const unitsDifference = newUnits - oldUnits;
    
    // Update stock based on transaction type and units change
    if (unitsDifference !== 0) {
      if (existingTransaction.type === 'entry') {
        // Entry: increase in units = increase stock, decrease in units = decrease stock
        await bloodStockCollection.updateOne(
          { bloodGroup: existingTransaction.bloodGroup },
          { 
            $inc: { units: unitsDifference },
            $set: { lastUpdated: new Date() }
          }
        );
      } else if (existingTransaction.type === 'donate') {
        // Donate: increase in units = decrease stock, decrease in units = increase stock
        await bloodStockCollection.updateOne(
          { bloodGroup: existingTransaction.bloodGroup },
          { 
            $inc: { units: -unitsDifference },
            $set: { lastUpdated: new Date() }
          }
        );
      } else if (existingTransaction.type === 'exchange') {
        // Exchange: adjust both blood groups
        await bloodStockCollection.updateOne(
          { bloodGroup: existingTransaction.fromBloodGroup },
          { 
            $inc: { units: -unitsDifference },
            $set: { lastUpdated: new Date() }
          }
        );
        await bloodStockCollection.updateOne(
          { bloodGroup: existingTransaction.toBloodGroup },
          { 
            $inc: { units: unitsDifference },
            $set: { lastUpdated: new Date() }
          }
        );
      }
    }
    
    // Update transaction
    const updateData = {
      units: newUnits,
      updatedAt: new Date(),
      updatedBy: req.admin?.phone || req.admin?.email || 'system'
    };
    
    if (donorName !== undefined) updateData.donorName = donorName;
    if (donorPhone !== undefined) updateData.donorPhone = donorPhone;
    if (receiverName !== undefined) updateData.receiverName = receiverName;
    if (receiverPhone !== undefined) updateData.receiverPhone = receiverPhone;
    if (hospitalName !== undefined) updateData.hospitalName = hospitalName;
    if (patientId !== undefined) updateData.patientId = patientId;
    if (notes !== undefined) updateData.notes = notes;
    
    await bloodTransactionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({
      success: true,
      message: 'Transaction updated successfully',
      unitsDifference
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction',
      error: error.message
    });
  }
};

// Delete blood transaction
const deleteBloodTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { bloodTransactionsCollection, bloodStockCollection } = getCollections();
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }
    
    // Get existing transaction
    const transaction = await bloodTransactionsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Restore stock based on transaction type
    if (transaction.type === 'entry') {
      // Entry: remove the units that were added
      await bloodStockCollection.updateOne(
        { bloodGroup: transaction.bloodGroup },
        { 
          $inc: { units: -transaction.units },
          $set: { lastUpdated: new Date() }
        }
      );
    } else if (transaction.type === 'donate') {
      // Donate: restore the units that were donated
      await bloodStockCollection.updateOne(
        { bloodGroup: transaction.bloodGroup },
        { 
          $inc: { units: transaction.units },
          $set: { lastUpdated: new Date() }
        }
      );
    } else if (transaction.type === 'exchange') {
      // Exchange: reverse both blood group changes
      await bloodStockCollection.updateOne(
        { bloodGroup: transaction.fromBloodGroup },
        { 
          $inc: { units: transaction.units },
          $set: { lastUpdated: new Date() }
        }
      );
      await bloodStockCollection.updateOne(
        { bloodGroup: transaction.toBloodGroup },
        { 
          $inc: { units: -transaction.units },
          $set: { lastUpdated: new Date() }
        }
      );
    }
    
    // Delete transaction
    await bloodTransactionsCollection.deleteOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      message: 'Transaction deleted and stock restored successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction',
      error: error.message
    });
  }
};

// Check if user exists by phone
const checkUserByPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const { usersCollection } = getCollections();
    const user = await usersCollection.findOne({ phone: phone.trim() });

    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          Name: user.Name || user.name || "",
          name: user.name || user.Name || "",
          phone: user.phone,
          email: user.email,
          bloodGroup: user.bloodGroup,
          bloodGiven: user.bloodGiven || 0,
          bloodTaken: user.bloodTaken || 0
        }
      });
    } else {
      res.json({
        success: true,
        user: null,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error('Check user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check user',
      error: error.message
    });
  }
};

// Create donation history
const createDonationHistory = async (req, res) => {
  try {
    const {
      donorName,
      donorPhone,
      donorAddress,
      bloodGroup,
      units,
      bloodBagNumber,
      userId,
      isRegisteredUser,
      notes
    } = req.body;

    const { donationHistoryCollection } = getCollections();

    if (!bloodBagNumber || bloodBagNumber.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Blood bag number is required'
      });
    }

    // Check if blood bag number already exists
    const existingBag = await donationHistoryCollection.findOne({
      bloodBagNumber: bloodBagNumber.trim()
    });

    if (existingBag) {
      return res.status(400).json({
        success: false,
        message: 'Blood bag number already exists'
      });
    }

    const donationHistory = await donationHistoryCollection.insertOne({
      donorName,
      donorPhone: donorPhone || '',
      donorAddress: donorAddress || '',
      bloodGroup,
      units: parseInt(units),
      bloodBagNumber: bloodBagNumber.trim(),
      userId: userId || null,
      isRegisteredUser: isRegisteredUser || false,
      donationDate: new Date(),
      status: 'completed',
      notes: notes || ''
    });

    res.json({
      success: true,
      message: `Donation history created for ${isRegisteredUser ? 'registered' : 'unregistered'} user`,
      historyId: donationHistory.insertedId
    });
  } catch (error) {
    console.error('Create donation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create donation history',
      error: error.message
    });
  }
};

// Get donation history with bag numbers
const getDonationHistoryList = async (req, res) => {
  try {
    const { donationHistoryCollection, usersCollection, donationRequestsCollection } = getCollections();

    const history = await donationHistoryCollection
      .find({})
      .sort({ donationDate: -1 })
      .limit(500)
      .toArray();

    const userIds = history
      .map((item) => item.userId)
      .filter((id) => id && ObjectId.isValid(String(id)))
      .map((id) => new ObjectId(String(id)));

    const requestIds = history
      .map((item) => item.donationRequestId || item.userId)
      .filter((id) => id && ObjectId.isValid(String(id)))
      .map((id) => new ObjectId(String(id)));

    const users = userIds.length
      ? await usersCollection
          .find({ _id: { $in: userIds } }, { projection: { Name: 1, name: 1, phone: 1 } })
          .toArray()
      : [];

    const donationRequests = requestIds.length
      ? await donationRequestsCollection
          .find({ _id: { $in: requestIds } }, { projection: { donorName: 1, donorPhone: 1 } })
          .toArray()
      : [];

    const userMap = new Map(
      users.map((u) => [String(u._id), { name: u.Name || u.name || "", phone: u.phone || "" }])
    );

    const donationRequestMap = new Map(
      donationRequests.map((r) => [String(r._id), { name: r.donorName || "", phone: r.donorPhone || "" }])
    );

    const historyWithUser = history.map((item) => {
      const userInfo = item.userId ? userMap.get(String(item.userId)) : null;
      const requestInfo = item.donationRequestId
        ? donationRequestMap.get(String(item.donationRequestId))
        : item.userId
        ? donationRequestMap.get(String(item.userId))
        : null;
      return {
        ...item,
        donorName: item.donorName || userInfo?.name || requestInfo?.name || "",
        donorPhone: item.donorPhone || userInfo?.phone || requestInfo?.phone || "",
      };
    });

    res.json({
      success: true,
      history: historyWithUser || []
    });
  } catch (error) {
    console.error('Get donation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation history',
      error: error.message
    });
  }
};

// Update donation blood usage status
const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      usedDate,
      usedBy,
      patientName,
      hospital,
      notes
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Donation ID is required'
      });
    }

    if (status === 'used' && (!usedDate || !usedBy)) {
      return res.status(400).json({
        success: false,
        message: 'Used Date and Used By are required when marking as used'
      });
    }

    const { donationHistoryCollection } = getCollections();

    const updateData = {
      status: status || 'available',
      updatedAt: new Date()
    };

    if (status === 'used') {
      updateData.usedDate = new Date(usedDate);
      updateData.usedBy = usedBy || '';
      updateData.patientName = patientName || '';
      updateData.hospital = hospital || '';
    }

    if (notes) {
      updateData.notes = notes;
    }

    const result = await donationHistoryCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.json({
      success: true,
      message: `Blood status updated to ${status}`,
      donation: result.value
    });
  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update donation status',
      error: error.message
    });
  }
};

// Get available blood bags for a specific blood group
const getAvailableBloodBags = async (req, res) => {
  try {
    const { bloodGroup } = req.query;
    
    // Trim and validate blood group
    const trimmedBloodGroup = bloodGroup ? bloodGroup.trim() : null;

    if (!trimmedBloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Blood group is required'
      });
    }

    const { donationHistoryCollection } = getCollections();

    console.log(`Fetching available blood bags for group: ${trimmedBloodGroup}`);

    // Fetch bags ONLY from donationHistoryCollection
    // Get all bags that haven't been used yet (bloodUsed: false or undefined)
    const bags = await donationHistoryCollection
      .find({
        bloodGroup: trimmedBloodGroup,
        $or: [
          { bloodUsed: false },
          { bloodUsed: { $exists: false } }
        ]
      })
      .sort({ donationDate: -1 })
      .project({
        _id: 1,
        bloodBagNumber: 1,
        donorName: 1,
        donorPhone: 1,
        units: 1,
        bloodGroup: 1,
        donationDate: 1,
        bloodUsed: 1,
        usedFor: 1
      })
      .toArray();

    console.log(`Found ${bags.length} available bags for ${trimmedBloodGroup}`);

    res.json({
      success: true,
      bags: bags
    });
  } catch (error) {
    console.error('Get available blood bags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available blood bags',
      error: error.message
    });
  }
};

// Mark blood as used and link to patient
const markBloodAsUsed = async (req, res) => {
  try {
    const { bloodBagNumber, patientName, patientId, hospitalName, doctorName, dateUsed, usedBy, notes } = req.body;

    if (!bloodBagNumber) {
      return res.status(400).json({
        success: false,
        message: 'Blood bag number is required'
      });
    }

    const { donationHistoryCollection } = getCollections();

    // Update the donation history record with patient info
    const result = await donationHistoryCollection.findOneAndUpdate(
      { bloodBagNumber: bloodBagNumber },
      {
        $set: {
          bloodUsed: true,
          usedFor: {
            patientName: patientName || null,
            patientId: patientId || null,
            hospitalName: hospitalName || null,
            doctorName: doctorName || null,
            dateUsed: dateUsed ? new Date(dateUsed) : new Date(),
            usedBy: usedBy || null,
            notes: notes || null,
          },
          updatedAt: new Date(),
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({
        success: false,
        message: 'Blood bag not found'
      });
    }

    res.json({
      success: true,
      message: 'Blood marked as used successfully',
      data: result.value
    });
  } catch (error) {
    console.error('Mark blood as used error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark blood as used',
      error: error.message
    });
  }
};

// Get donor's blood tracking info (for donor to see who received their blood)
const getDonorBloodTracking = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const { donationHistoryCollection } = getCollections();

    const donations = await donationHistoryCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ donationDate: -1 })
      .toArray();

    const trackingInfo = donations.map(donation => ({
      _id: donation._id,
      bloodBagNumber: donation.bloodBagNumber,
      bloodGroup: donation.bloodGroup,
      unitsGiven: donation.unitsGiven,
      donationDate: donation.donationDate,
      status: donation.status,
      bloodUsed: donation.bloodUsed,
      usedFor: donation.usedFor || null,
    }));

    res.json({
      success: true,
      data: trackingInfo
    });
  } catch (error) {
    console.error('Get donor blood tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood tracking info',
      error: error.message
    });
  }
};

module.exports = {
  getBloodStock,
  bloodEntry,
  bloodDonate,
  bloodExchange,
  getBloodTransactions,
  getTransactionStats,
  getAllBloodStock,
  getBloodStockByUserGroup,
  updateBloodTransaction,
  deleteBloodTransaction,
  checkUserByPhone,
  createDonationHistory,
  getDonationHistoryList,
  updateDonationStatus,
  getAvailableBloodBags,
  markBloodAsUsed,
  getDonorBloodTracking
};