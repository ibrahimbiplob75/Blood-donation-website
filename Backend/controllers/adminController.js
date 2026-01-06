const { getCollections } = require('../config/database');
const {  ObjectId } = require('mongodb');
const { getUploadByInfo } = require('../utils/helpers');

const getAdminUsers = async (req, res) => {
  try {
    const { adminCollection } = getCollections();
    const users = await adminCollection
      .find({}, { projection: { password: 0 } }) 
      .sort({ _id: -1 })
      .toArray();
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};
const createAdminUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, role, subrole, branch, password } = req.body;
    
    const { adminCollection } = getCollections();
    
    const existingUser = await adminCollection.findOne({ 
      email: email.trim().toLowerCase() 
    });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone || '',
      email: email.trim().toLowerCase(),
      role: role,
      subrole: subrole,
      branch: branch,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await adminCollection.insertOne(newUser);
    
    const createdUser = await adminCollection.findOne(
      { _id: result.insertedId },
      { projection: { password: 0 } }
    );
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: createdUser
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to create user',
      error: error.message 
    });
  }
};
const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, email, role, subrole, branch, password } = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const { adminCollection } = getCollections();
    const existingUser = await adminCollection.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const duplicateUser = await adminCollection.findOne({ 
      email: email.trim().toLowerCase(), 
      _id: { $ne: new ObjectId(id) } 
    });
    if (duplicateUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    
    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone || '',
      email: email.trim().toLowerCase(),
      role: role,
      subrole: subrole,
      branch: branch,
      updatedAt: new Date()
    };
    
    if (password && password.trim()) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }
    
    const updateResult = await adminCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const updatedUser = await adminCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );
    
    res.status(200).json({ 
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to update user',
      error: error.message 
    });
  }
};
const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const { adminCollection } = getCollections();
    const result = await adminCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'User deleted successfully',
      id: id 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to delete user',
      error: error.message 
    });
  }
};

const getBlood=async(req,res)=>{
  const { id } = req.params;
      try {
        const { resultsCollection } =  getCollections();
        const result = await resultsCollection.findOne({ _id: new ObjectId(id) });
        result
          ? res.status(200).json(result)
          : res.status(404).json({ message: 'Result not found' });
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

const updateBlood = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  delete updatedData._id;

  try {
    const { resultsCollection } = getCollections();
    const result = await resultsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.status(200).json({ message: "Result updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteBlood=async(req,res)=>{
  const { id } = req.params;
      try {
        const { resultsCollection } =  getCollections();
        const deleteResult = await resultsCollection.deleteOne({ _id: new ObjectId(id) });
        
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ message: "Result not found" });
        }
        
        res.json({ message: "Result deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: "Failed to delete result" });
      }
}

const getDashboardStats = async (req, res) => {
  try {
    const { 
      usersCollection, 
      bloodRequestsCollection,
      bloodStockCollection  // Add this collection
    } = getCollections();
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const [
      totalDonors,
      activeDonors,
      totalDonations,
      thisMonthDonations,
      pendingRequests,
      activeRequests,
      fulfilledRequests,
      cancelledRequests,
      bloodStockData,  // Changed from availableDonorsByBloodType
      donorsByBloodType,
      recentDonations,
      urgentRequests,
      requestsByDistrict
    ] = await Promise.all([
      // Total registered donors (users with role='user')
      usersCollection.countDocuments({ role: 'user' }),
      
      // Active donors (available = true OR donated recently)
      usersCollection.countDocuments({
        role: 'user',
        $or: [
          { available: true },
          { lastDonationDate: { $gte: threeMonthsAgo } }
        ]
      }),
      
      // Total donations count (users who have lastDonationDate)
      usersCollection.countDocuments({
        role: 'user',
        lastDonationDate: { $exists: true, $ne: null }
      }),
      
      // This month donations
      usersCollection.countDocuments({
        role: 'user',
        lastDonationDate: { $gte: startOfMonth }
      }),
      
      // Pending blood requests
      bloodRequestsCollection.countDocuments({ status: 'pending' }),
      
      // Active blood requests (donor assigned but not yet fulfilled)
      bloodRequestsCollection.countDocuments({ status: 'active' }),
      
      // Fulfilled blood requests
      bloodRequestsCollection.countDocuments({ status: 'fulfilled' }),
      
      // Cancelled blood requests
      bloodRequestsCollection.countDocuments({ status: 'cancelled' }),
      
      // GET BLOOD STOCK FROM INVENTORY COLLECTION (CHANGED)
      bloodStockCollection.find({}).toArray(),
      
      // Total donors by blood type
      usersCollection.aggregate([
        {
          $match: {
            role: 'user',
            bloodGroup: { $exists: true, $ne: '' }
          }
        },
        {
          $group: {
            _id: '$bloodGroup',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      // Recent donations (last 10 donors who donated)
      usersCollection.find({
        role: 'user',
        lastDonationDate: { $exists: true, $ne: null }
      })
      .sort({ lastDonationDate: -1 })
      .limit(10)
      .project({ Name: 1, bloodGroup: 1, lastDonationDate: 1 })
      .toArray(),
      
      // Urgent blood requests (emergency status, pending or active)
      bloodRequestsCollection.find({
        $or: [{ status: 'pending' }, { status: 'active' }],
        urgency: 'emergency'
      })
      .limit(10)
      .project({ bloodGroup: 1, hospitalName: 1, district: 1, status: 1 })
      .toArray(),
      
      // Requests by district (pending only)
      bloodRequestsCollection.aggregate([
        {
          $match: { status: 'pending' }
        },
        {
          $group: {
            _id: '$district',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray()
    ]);
    
    // FORMAT BLOOD STOCK FROM INVENTORY COLLECTION (CHANGED)
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const bloodStock = {};
    
    bloodGroups.forEach(group => {
      const stockItem = bloodStockData.find(item => item.bloodGroup === group);
      bloodStock[group] = stockItem ? stockItem.units : 0;
    });
    
    // Format donor stats by blood type
    const donorStats = donorsByBloodType.map(item => ({
      bloodType: item._id,
      count: item.count
    }));
    
    // Format recent donations
    const recentDonationsFormatted = recentDonations.map(donation => ({
      donorName: donation.Name || 'Anonymous',
      bloodType: donation.bloodGroup,
      date: donation.lastDonationDate ? new Date(donation.lastDonationDate).toLocaleDateString() : 'N/A'
    }));
    
    // Format urgent requests
    const urgentRequestsFormatted = urgentRequests.map(request => ({
      bloodType: request.bloodGroup,
      units: '1',
      hospital: request.hospitalName || 'Unknown Hospital',
      status: request.status
    }));
    
    // Format branch stats (using districts)
    const branchStats = requestsByDistrict.map(item => ({
      branch: item._id || 'Unknown',
      count: item.count
    }));

    res.json({
      success: true,
      totalDonors,
      activeDonors,
      totalDonations,
      thisMonthDonations,
      pendingRequests,
      activeRequests,
      fulfilledRequests,
      cancelledRequests,
      bloodStock,
      donorStats,
      branchStats,
      recentDonations: recentDonationsFormatted,
      urgentRequests: urgentRequestsFormatted,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard stats', 
      error: error.message 
    });
  }
};
const getDonorHistory = async (req, res) => {
  try {
    const { usersCollection } = getCollections();
    
    const donors = await usersCollection
      .find({ 
        role: 'user',
        bloodGroup: { $exists: true, $ne: '' }
      })
      .project({ 
        Name: 1, 
        phone: 1, 
        bloodGroup: 1, 
        lastDonateDate: 1,
        available: 1,
        district: 1,
        bloodGiven: 1,
        bloodTaken: 1
      })
      .sort({ lastDonateDate: -1 })
      .toArray();

    const today = new Date();
    
    const donorsWithAvailability = donors.map(donor => {
      let isAvailable = true;
      let nextAvailableDate = null;
      
      // Use lastDonateDate (the actual field name in database)
      const lastDonationDate = donor.lastDonateDate;
      
      if (lastDonationDate) {
        const lastDate = new Date(lastDonationDate);
        const fourMonthsLater = new Date(lastDate);
        fourMonthsLater.setMonth(fourMonthsLater.getMonth() + 4);
        
        isAvailable = today >= fourMonthsLater;
        nextAvailableDate = fourMonthsLater;
      }
      
      return {
        ...donor,
        lastDonationDate: lastDonationDate, // Add this field for frontend compatibility
        isAvailable,
        nextAvailableDate: nextAvailableDate ? nextAvailableDate.toISOString() : null,
        bloodGiven: donor.bloodGiven || 0,
        bloodTaken: donor.bloodTaken || 0
      };
    });

    res.json({
      success: true,
      donors: donorsWithAvailability
    });
  } catch (error) {
    console.error('Donor history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch donor history', 
      error: error.message 
    });
  }
};

const getStatistics = async (req, res) => {
  try {
    const { statisticsCollection } = getCollections();
    
    let stats = await statisticsCollection.findOne();
    
    if (!stats) {
      const newStats = {
        activeDonors: 0,
        patientsHelped: 0,
        unitsDonated: 0,
        updatedAt: new Date(),
        updatedBy: null,
      };
      await statisticsCollection.insertOne(newStats);
      stats = newStats;
    }
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

const updateStatistics = async (req, res) => {
  try {
    const { statisticsCollection } = getCollections();
    const { activeDonors, patientsHelped, unitsDonated } = req.body;
    
    if (activeDonors === undefined || patientsHelped === undefined || unitsDonated === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields (activeDonors, patientsHelped, unitsDonated) are required'
      });
    }
    
    const updateData = {
      activeDonors: parseInt(activeDonors),
      patientsHelped: parseInt(patientsHelped),
      unitsDonated: parseInt(unitsDonated),
      updatedAt: new Date(),
      updatedBy: req.user?.email || 'admin'
    };
    
    const result = await statisticsCollection.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true, returnDocument: 'after' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Statistics updated successfully',
      data: result.value
    });
  } catch (error) {
    console.error('Update statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getBlood,
  updateBlood,
  deleteBlood,
  getDashboardStats,
  getDonorHistory,
  getStatistics,
  updateStatistics
};

