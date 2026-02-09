const mongoose = require('mongoose');

const DonationHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bloodRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest',
    required: true,
  },
  bloodBagNumber: {
    type: String,
    required: [true, 'Please provide blood bag number'],
    unique: true,
  },
  bloodGroup: {
    type: String,
    required: [true, 'Please provide blood group'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  unitsGiven: {
    type: Number,
    required: [true, 'Please specify units given'],
    min: 0.5,
  },
  donationDate: {
    type: Date,
    required: [true, 'Please provide donation date'],
  },
  approvalDate: {
    type: Date,
    required: [true, 'Please provide approval date'],
  },
  approvedBy: {
    type: String,
    required: [true, 'Please provide admin who approved'],
  },
  patientName: {
    type: String,
    required: false,
  },
  hospitalName: {
    type: String,
    required: false,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled'],
    default: 'completed',
  },
  bloodUsed: {
    type: Boolean,
    default: false,
  },
  usedFor: {
    patientName: {
      type: String,
      required: false,
    },
    patientId: {
      type: String,
      required: false,
    },
    hospitalName: {
      type: String,
      required: false,
    },
    doctorName: {
      type: String,
      required: false,
    },
    dateUsed: {
      type: Date,
      required: false,
    },
    usedBy: {
      type: String,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
  },
  eligibility: {
    isEligible: {
      type: Boolean,
      default: false,
    },
    ineligibilityReasons: {
      type: [String],
      default: [],
    },
    warningMessages: {
      type: [String],
      default: [],
    },
    checkedAt: {
      type: Date,
    },
    checks: {
      age: Number,
      weight: Number,
      daysSinceLastDonation: Number,
      hasRestrictedMedicalConditions: Boolean,
    },
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
DonationHistorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DonationHistory', DonationHistorySchema);
