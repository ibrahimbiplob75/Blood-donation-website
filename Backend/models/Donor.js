const mongoose = require('mongoose');

const DonorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bloodGroup: {
    type: String,
    required: [true, 'Please provide blood group'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please provide date of birth'],
  },
  weight: {
    type: Number,
    required: [true, 'Please provide weight in kg'],
    min: 50,
  },
  lastDonationDate: {
    type: Date,
  },
  nextEligibleDate: {
    type: Date,
  },
  isEligible: {
    type: Boolean,
    default: true,
  },
  totalDonations: {
    type: Number,
    default: 0,
  },
  medicalHistory: {
    chronicDiseases: [String],
    currentMedications: [String],
    allergies: [String],
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preferredLocations: [String],
    preferredDays: [String],
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

// Update nextEligibleDate before saving
DonorSchema.pre('save', function(next) {
  if (this.lastDonationDate) {
    const nextDate = new Date(this.lastDonationDate);
    nextDate.setDate(nextDate.getDate() + 90); // 90 days interval
    this.nextEligibleDate = nextDate;
    this.isEligible = new Date() >= nextDate;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Donor', DonorSchema);
