/**
 * Blood Donor Eligibility Checker
 * Validates donor eligibility based on medical and procedural requirements
 */

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Calculate days since last donation
 */
const daysSinceLastDonation = (lastDonationDate) => {
  if (!lastDonationDate) return null;
  const last = new Date(lastDonationDate);
  const today = new Date();
  const diffTime = Math.abs(today - last);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check donor eligibility
 * Returns { isEligible: boolean, reasons: [] }
 */
const checkDonorEligibility = (donorData) => {
  const ineligibilityReasons = [];
  const warningMessages = [];

  // 1. Age Check (18-65 years)
  if (donorData.dateOfBirth) {
    const age = calculateAge(donorData.dateOfBirth);
    if (age === null) {
      ineligibilityReasons.push('Invalid date of birth provided');
    } else if (age < 18) {
      ineligibilityReasons.push(`Age ${age} - Minimum age required is 18 years`);
    } else if (age > 65) {
      ineligibilityReasons.push(`Age ${age} - Maximum age allowed is 65 years`);
    }
  } else {
    warningMessages.push('Date of birth not provided - age verification required');
  }

  // 2. Weight Check (minimum 50 kg)
  if (donorData.weight) {
    const weight = parseInt(donorData.weight);
    if (weight < 50) {
      ineligibilityReasons.push(`Weight ${weight}kg - Minimum weight required is 50 kg`);
    }
  } else {
    warningMessages.push('Weight not provided - weight verification required');
  }

  // 3. Last Donation Date Check (minimum 56 days since last donation)
  const MINIMUM_DAYS_BETWEEN_DONATIONS = 56;
  if (donorData.lastDonationDate) {
    const daysSince = daysSinceLastDonation(donorData.lastDonationDate);
    if (daysSince === null) {
      ineligibilityReasons.push('Invalid last donation date');
    } else if (daysSince < MINIMUM_DAYS_BETWEEN_DONATIONS) {
      const daysRemaining = MINIMUM_DAYS_BETWEEN_DONATIONS - daysSince;
      ineligibilityReasons.push(
        `Only ${daysSince} days since last donation - Must wait ${daysRemaining} more days (minimum 56 days between donations)`
      );
    }
  }

  // 4. Medical Conditions Check
  if (donorData.medicalConditions && donorData.medicalConditions !== 'None') {
    const conditions = donorData.medicalConditions.toLowerCase();
    const restrictedConditions = [
      'hiv', 'hepatitis', 'malaria', 'tb', 'tuberculosis', 
      'heart disease', 'cancer', 'epilepsy', 'diabetes'
    ];
    
    const hasRestrictedCondition = restrictedConditions.some(condition => 
      conditions.includes(condition)
    );

    if (hasRestrictedCondition) {
      ineligibilityReasons.push(
        `Medical condition detected: ${donorData.medicalConditions} - Requires medical clearance`
      );
    }
  }

  // 5. Blood Group Validation
  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (donorData.bloodGroup && !validBloodGroups.includes(donorData.bloodGroup)) {
    ineligibilityReasons.push(`Invalid blood group: ${donorData.bloodGroup}`);
  } else if (!donorData.bloodGroup) {
    ineligibilityReasons.push('Blood group is required');
  }

  return {
    isEligible: ineligibilityReasons.length === 0,
    ineligibilityReasons: ineligibilityReasons,
    warningMessages: warningMessages,
    eligibilityChecks: {
      age: donorData.dateOfBirth ? calculateAge(donorData.dateOfBirth) : null,
      weight: donorData.weight ? parseInt(donorData.weight) : null,
      daysSinceLastDonation: donorData.lastDonationDate ? daysSinceLastDonation(donorData.lastDonationDate) : null,
      hasRestrictedMedicalConditions: donorData.medicalConditions && donorData.medicalConditions !== 'None'
    }
  };
};

/**
 * Get eligibility status from DonationHistory or user data
 */
const getEligibilityStatus = (donationHistoryEntry) => {
  if (!donationHistoryEntry) return null;

  return {
    isEligible: donationHistoryEntry.eligibility?.isEligible || false,
    reasons: donationHistoryEntry.eligibility?.ineligibilityReasons || [],
    checkedAt: donationHistoryEntry.eligibility?.checkedAt || donationHistoryEntry.approvalDate,
    checks: donationHistoryEntry.eligibility?.checks || {}
  };
};

module.exports = {
  checkDonorEligibility,
  calculateAge,
  daysSinceLastDonation,
  getEligibilityStatus,
  MINIMUM_DAYS_BETWEEN_DONATIONS: 56
};
