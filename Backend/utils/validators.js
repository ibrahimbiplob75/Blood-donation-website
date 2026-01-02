const { BLOOD_GROUPS, DONATION_RULES } = require('./constants');

// Validate blood group
exports.isValidBloodGroup = (bloodGroup) => {
  return BLOOD_GROUPS.includes(bloodGroup);
};

// Validate email format
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (basic validation)
exports.isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

// Validate age based on date of birth
exports.isValidAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= DONATION_RULES.MIN_AGE && age <= DONATION_RULES.MAX_AGE;
};

// Validate weight
exports.isValidWeight = (weight) => {
  return weight >= DONATION_RULES.MIN_WEIGHT;
};

// Validate donor eligibility based on last donation date
exports.isEligibleToDonate = (lastDonationDate) => {
  if (!lastDonationDate) return true;
  
  const today = new Date();
  const lastDonation = new Date(lastDonationDate);
  const daysSinceLastDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
  
  return daysSinceLastDonation >= DONATION_RULES.DONATION_INTERVAL;
};

// Validate password strength
exports.isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};
