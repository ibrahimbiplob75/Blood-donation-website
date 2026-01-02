export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const USER_ROLES = {
  ADMIN: 'admin',
  DONOR: 'donor',
  HOSPITAL: 'hospital',
  RECIPIENT: 'recipient'
};

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

export const URGENCY_LEVELS = {
  NORMAL: 'normal',
  URGENT: 'urgent',
  EMERGENCY: 'emergency'
};

export const DONATION_ELIGIBILITY = {
  MIN_AGE: 18,
  MAX_AGE: 65,
  MIN_WEIGHT: 50, // kg
  DONATION_INTERVAL: 90 // days
};

export const API_ENDPOINTS = {
  AUTH: '/auth',
  DONOR: '/donor',
  REQUEST: '/request',
  STOCK: '/stock',
  ADMIN: '/admin'
};
