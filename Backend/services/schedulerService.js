const cron = require('node-cron');
const Donor = require('../models/Donor');
const { sendLowStockAlerts } = require('./notificationService');

// Update donor eligibility status daily
exports.updateDonorEligibility = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running eligibility update job...');
      
      const donors = await Donor.find({});
      let updated = 0;

      for (const donor of donors) {
        if (donor.lastDonationDate) {
          const today = new Date();
          const nextEligibleDate = new Date(donor.lastDonationDate);
          nextEligibleDate.setDate(nextEligibleDate.getDate() + 90);

          const wasEligible = donor.isEligible;
          donor.isEligible = today >= nextEligibleDate;

          if (wasEligible !== donor.isEligible) {
            await donor.save();
            updated++;
          }
        }
      }

      console.log(`Eligibility update complete. Updated ${updated} donors.`);
    } catch (error) {
      console.error('Eligibility update error:', error);
    }
  });
};

// Check low stock levels every 6 hours
exports.checkLowStock = () => {
  cron.schedule('0 */6 * * *', async () => {
    try {
      console.log('Checking low stock levels...');
      await sendLowStockAlerts();
    } catch (error) {
      console.error('Low stock check error:', error);
    }
  });
};

// Initialize all scheduled jobs
exports.initScheduler = () => {
  console.log('Initializing scheduled jobs...');
  this.updateDonorEligibility();
  this.checkLowStock();
  console.log('Scheduled jobs initialized successfully');
};
