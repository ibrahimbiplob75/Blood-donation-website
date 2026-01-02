const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['entry', 'donate', 'exchange', 'disposal'],
    required: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  fromBloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  toBloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  units: {
    type: Number,
    required: true,
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
  },
  donorName: String,
  donorPhone: String,
  donorAddress: String,
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  receiverName: String,
  receiverPhone: String,
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest',
  },
  hospitalName: String,
  patientId: String,
  neededDate: Date,
  notes: String,
  newStock: Number,
  fromStock: Number,
  toStock: Number,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
