// Blood group constants
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

module.exports = {
  PORT: process.env.PORT || 5001,
  JWT_SECRET: process.env.JWT_SECRET,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  DB_URI: process.env.DB_URI,
  NODE_ENV: process.env.NODE_ENV || 'production',
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  BLOOD_GROUPS: BLOOD_GROUPS
};

// Also export separately for convenience
exports.BLOOD_GROUPS = BLOOD_GROUPS;

// User roles
exports.USER_ROLES = {
  DONOR: 'donor',
  RECIPIENT: 'recipient',
  HOSPITAL: 'hospital',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

// Request status
exports.REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

// Urgency levels
exports.URGENCY_LEVELS = {
  NORMAL: 'normal',
  URGENT: 'urgent',
  EMERGENCY: 'emergency',
};

// Donation eligibility
exports.DONATION_RULES = {
  MIN_AGE: 18,
  MAX_AGE: 65,
  MIN_WEIGHT: 50, // kg
  DONATION_INTERVAL: 90, // days
  MIN_HEMOGLOBIN_MALE: 13, // g/dL
  MIN_HEMOGLOBIN_FEMALE: 12, // g/dL
};

// Stock thresholds
exports.STOCK_THRESHOLDS = {
  LOW: 5,
  CRITICAL: 2,
  OPTIMAL: 20,
};

// Transaction types
exports.TRANSACTION_TYPES = {
  ENTRY: 'entry',
  DONATE: 'donate',
  EXCHANGE: 'exchange',
  DISPOSAL: 'disposal',
};
