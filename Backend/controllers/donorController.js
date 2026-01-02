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
