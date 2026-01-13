const Donor = require('../models/Donor');
const User = require('../models/User');

// @desc    Register as donor
// @route   POST /api/donor/register
// @access  Private
exports.registerDonor = async (req, res) => {
  try {
    const { bloodGroup, dateOfBirth, weight, lastDonationDate, medicalHistory, emergencyContact } = req.body;

    // Check if user already registered as donor
    const existingDonor = await Donor.findOne({ user: req.user.id });
    if (existingDonor) {
      return res.status(400).json({ message: 'Already registered as a donor' });
    }

    // Create donor profile
    const donor = await Donor.create({
      user: req.user.id,
      bloodGroup,
      dateOfBirth,
      weight,
      lastDonationDate,
      medicalHistory,
      emergencyContact,
    });

    res.status(201).json({
      success: true,
      data: donor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get donor profile
// @route   GET /api/donor/profile
// @access  Private
exports.getDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user.id }).populate('user', 'name email phone address');
    
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    res.status(200).json({
      success: true,
      data: donor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update donor profile
// @route   PUT /api/donor/profile
// @access  Private
exports.updateDonorProfile = async (req, res) => {
  try {
    let donor = await Donor.findOne({ user: req.user.id });
    
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    donor = await Donor.findByIdAndUpdate(donor._id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: donor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all donors
// @route   GET /api/donor/all
// @access  Private/Admin
exports.getAllDonors = async (req, res) => {
  try {
    const { bloodGroup, isEligible, isAvailable } = req.query;
    
    let query = {};
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (isEligible) query.isEligible = isEligible === 'true';
    if (isAvailable) query['availability.isAvailable'] = isAvailable === 'true';

    const donors = await Donor.find(query).populate('user', 'name email phone address');
    
    res.status(200).json({
      success: true,
      count: donors.length,
      data: donors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search donors
// @route   POST /api/donor/search
// @access  Private
exports.searchDonors = async (req, res) => {
  try {
    const { bloodGroup, location, isEligible } = req.body;
    
    let query = {};
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (isEligible !== undefined) query.isEligible = isEligible;

    const donors = await Donor.find(query).populate('user', 'name email phone address');
    
    res.status(200).json({
      success: true,
      count: donors.length,
      data: donors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get donor statistics from Users collection (public endpoint)
// @route   GET /api/donor/public-stats
// @access  Public
exports.getDonorStats = async (req, res) => {
  try {
    const User = require('../models/User');
    const BloodStock = require('../models/BloodStock');

    // Calculate date 120 days ago for eligibility
    const eligibilityDate = new Date();
    eligibilityDate.setDate(eligibilityDate.getDate() - 120);

    // Get all users with bloodGroup (potential donors)
    const allUsers = await User.find({ 
      bloodGroup: { $exists: true, $ne: null }
    }).select('bloodGroup district lastDonateDate');

    // Initialize statistics
    let totalDonors = allUsers.length;
    let eligibleDonors = 0;
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const bloodGroupStats = {};
    const districtStats = {};

    // Initialize blood group stats with zeros
    bloodGroups.forEach(type => {
      bloodGroupStats[type] = 0;
    });

    // Process each user to calculate statistics
    allUsers.forEach(user => {
      // Count by blood group
      if (user.bloodGroup && bloodGroupStats.hasOwnProperty(user.bloodGroup)) {
        bloodGroupStats[user.bloodGroup]++;
      }

      // Count by district
      if (user.district) {
        districtStats[user.district] = (districtStats[user.district] || 0) + 1;
      }

      // Check eligibility: lastDonateDate is more than 120 days ago OR no lastDonateDate
      if (!user.lastDonateDate || new Date(user.lastDonateDate) <= eligibilityDate) {
        eligibleDonors++;
      }
    });

    // Get blood stock data from BloodStock collection
    const bloodStocks = await BloodStock.find({});
    const bloodStockStats = {};
    
    bloodGroups.forEach(type => {
      const stock = bloodStocks.find(s => s.bloodGroup === type);
      bloodStockStats[type] = stock ? stock.units : 0;
    });

    res.status(200).json({
      success: true,
      data: {
        totalDonors,
        eligibleDonors,
        bloodGroupStats,
        districtStats,
        bloodStockStats,
      },
    });
  } catch (error) {
    console.error('Error fetching donor statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching donor statistics',
      error: error.message 
    });
  }
};

