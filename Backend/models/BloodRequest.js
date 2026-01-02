const mongoose = require('mongoose');

const BloodRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientName: {
    type: String,
    required: [true, 'Please provide patient name'],
  },
  bloodGroup: {
    type: String,
    required: [true, 'Please provide blood group'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  unitsRequired: {
    type: Number,
    required: [true, 'Please specify units required'],
    min: 1,
  },
  urgency: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal',
  },
  hospital: {
    name: {
      type: String,
      required: [true, 'Please provide hospital name'],
    },
    address: String,
    contactNumber: String,
  },
  requiredDate: {
    type: Date,
    required: [true, 'Please provide required date'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'fulfilled', 'rejected', 'cancelled'],
    default: 'pending',
  },
  contactNumber: {
    type: String,
    required: [true, 'Please provide contact number'],
  },
  additionalInfo: {
    type: String,
  },
  patientCondition: {
    type: String,
  },
  fulfilledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
  },
  fulfilledDate: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt before saving
BloodRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);
