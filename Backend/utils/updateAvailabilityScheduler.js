const cron = require('node-cron');
const { getCollections } = require('../config/database');

const updateDonorAvailability = async () => {
  try {
    const { usersCollection } = getCollections();
    
    const today = new Date();

    const donors = await usersCollection.find({
      role: 'user',
      lastDonationDate: { $exists: true, $ne: null }
    }).toArray();
    
    let availableCount = 0;
    let unavailableCount = 0;
    
    for (const donor of donors) {
      const lastDate = new Date(donor.lastDonationDate);
      const fourMonthsLater = new Date(lastDate);
      fourMonthsLater.setMonth(fourMonthsLater.getMonth() + 4);
      
      const isNowAvailable = today >= fourMonthsLater;

      if (donor.available !== isNowAvailable) {
        await usersCollection.updateOne(
          { _id: donor._id },
          { 
            $set: { 
              available: isNowAvailable,
              updatedAt: new Date()
            } 
          }
        );
        
        if (isNowAvailable) {
          availableCount++;
        } else {
          unavailableCount++;
        }
      }
    }
    
    console.log(`[${new Date().toISOString()}] Availability update: ${availableCount} donors became available, ${unavailableCount} became unavailable`);
    
    return { availableCount, unavailableCount };
  } catch (error) {
    console.error('Error updating donor availability:', error);
    throw error;
  }
};

const startAvailabilityScheduler = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily donor availability check...');
    try {
      await updateDonorAvailability();
    } catch (error) {
      console.error('Scheduled availability update failed:', error);
    }
  });
  
  console.log('Donor availability scheduler started - runs daily at midnight');
};

const triggerAvailabilityUpdate = async () => {
  console.log('Manually triggering availability update...');
  return await updateDonorAvailability();
};

module.exports = {
  startAvailabilityScheduler,
  triggerAvailabilityUpdate,
  updateDonorAvailability
};