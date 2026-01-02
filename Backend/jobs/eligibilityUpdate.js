const Donor = require('../models/Donor');

// Update donor eligibility based on last donation date
const updateDonorEligibility = async () => {
  try {
    console.log('Starting eligibility update job...');
    
    const donors = await Donor.find({ lastDonationDate: { $exists: true, $ne: null } });
    let updatedCount = 0;

    for (const donor of donors) {
      const today = new Date();
      const nextEligibleDate = new Date(donor.lastDonationDate);
      nextEligibleDate.setDate(nextEligibleDate.getDate() + 90);

      const previousEligibility = donor.isEligible;
      donor.isEligible = today >= nextEligibleDate;
      donor.nextEligibleDate = nextEligibleDate;

      if (previousEligibility !== donor.isEligible) {
        await donor.save();
        updatedCount++;
      }
    }

    console.log(`Eligibility update complete. Updated ${updatedCount} out of ${donors.length} donors.`);
    return { success: true, updated: updatedCount, total: donors.length };
  } catch (error) {
    console.error('Eligibility update job error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { updateDonorEligibility };
