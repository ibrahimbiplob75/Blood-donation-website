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
      notes 
    } = req.body;
    
    const { bloodStockCollection, bloodTransactionsCollection } = getCollections();
    
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
      dateOfBirth: dateOfBirth || null,
      weight: weight || null,
      district: district || '',
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
      medicalConditions: medicalConditions || 'None',
      availability: availability || 'Available',
      notes: notes || '',
      donatedAt: new Date(),
      collectedBy: req.admin?.phone || req.admin?.email || 'system',
      previousStock: stockUpdate.value ? stockUpdate.value.units - parseInt(units) : 0,
      newStock: stockUpdate.value ? stockUpdate.value.units : parseInt(units),
      status: 'completed'
    });
    
    res.json({
      success: true,
      message: `${units} unit(s) of ${bloodGroup} added to stock`,
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

module.exports = {
  getBloodStock,
  bloodEntry,
  bloodDonate,
  bloodExchange,
  getBloodTransactions,
  getTransactionStats,
  getAllBloodStock,
  getBloodStockByUserGroup
};