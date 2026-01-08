// Blood-related type definitions

// Export blood groups array for easy import
module.exports.BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

module.exports.BloodTypes = {
  BLOOD_GROUPS: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  
  URGENCY_LEVELS: {
    NORMAL: 'normal',
    URGENT: 'urgent',
    EMERGENCY: 'emergency',
  },
  
  REQUEST_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
  },
  
  TRANSACTION_TYPES: {
    ENTRY: 'entry',
    DONATE: 'donate',
    EXCHANGE: 'exchange',
    DISPOSAL: 'disposal',
  },
};

// Blood compatibility chart
module.exports.BloodCompatibility = {
  'A+': { canReceiveFrom: ['A+', 'A-', 'O+', 'O-'], canDonateTo: ['A+', 'AB+'] },
  'A-': { canReceiveFrom: ['A-', 'O-'], canDonateTo: ['A+', 'A-', 'AB+', 'AB-'] },
  'B+': { canReceiveFrom: ['B+', 'B-', 'O+', 'O-'], canDonateTo: ['B+', 'AB+'] },
  'B-': { canReceiveFrom: ['B-', 'O-'], canDonateTo: ['B+', 'B-', 'AB+', 'AB-'] },
  'AB+': { canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canDonateTo: ['AB+'] },
  'AB-': { canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'], canDonateTo: ['AB+', 'AB-'] },
  'O+': { canReceiveFrom: ['O+', 'O-'], canDonateTo: ['A+', 'B+', 'AB+', 'O+'] },
  'O-': { canReceiveFrom: ['O-'], canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
};
