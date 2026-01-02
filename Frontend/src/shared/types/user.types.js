// User-related type definitions
module.exports.UserTypes = {
  USER_ROLES: {
    DONOR: 'donor',
    RECIPIENT: 'recipient',
    HOSPITAL: 'hospital',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
  },
  
  USER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING: 'pending',
  },
  
  VERIFICATION_STATUS: {
    VERIFIED: 'verified',
    UNVERIFIED: 'unverified',
    PENDING: 'pending',
  },
};

// Donor eligibility criteria
module.exports.DonorEligibility = {
  MIN_AGE: 18,
  MAX_AGE: 65,
  MIN_WEIGHT: 50, // kg
  DONATION_INTERVAL: 90, // days
  MIN_HEMOGLOBIN_MALE: 13, // g/dL
  MIN_HEMOGLOBIN_FEMALE: 12, // g/dL
};
