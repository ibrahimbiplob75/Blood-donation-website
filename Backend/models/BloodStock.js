const mongoose = require('mongoose');

const BloodStockSchema = new mongoose.Schema({
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    unique: true,
  },
  units: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
  },
  expiringUnits: [{
    units: Number,
    expiryDate: Date,
    batchNumber: String,
  }],
  location: {
    type: String,
    default: 'Main Blood Bank',
  },
});

// Update lastUpdated before saving
BloodStockSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Check if stock is low
BloodStockSchema.methods.isLowStock = function() {
  return this.units < this.lowStockThreshold;
};

module.exports = mongoose.model('BloodStock', BloodStockSchema);
