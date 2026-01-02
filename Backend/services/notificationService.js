const { sendEmail, emailTemplates } = require('./emailService');
const Donor = require('../models/Donor');
const BloodStock = require('../models/BloodStock');

// Send notification to donors based on blood group need
exports.notifyDonorsByBloodGroup = async (bloodGroup, hospital) => {
  try {
    const eligibleDonors = await Donor.find({
      bloodGroup,
      isEligible: true,
      'availability.isAvailable': true,
    }).populate('user', 'name email');

    const notifications = eligibleDonors.map(donor => {
      if (donor.user && donor.user.email) {
        return sendEmail({
          email: donor.user.email,
          subject: `Urgent: ${bloodGroup} Blood Needed`,
          html: emailTemplates.bloodRequest(donor.user.name, bloodGroup, hospital),
        });
      }
    });

    await Promise.all(notifications);
    console.log(`Notified ${eligibleDonors.length} donors for ${bloodGroup}`);
  } catch (error) {
    console.error('Notification error:', error);
  }
};

// Send low stock alerts to admins
exports.sendLowStockAlerts = async () => {
  try {
    const allStock = await BloodStock.find();
    const lowStock = allStock.filter(item => item.isLowStock());

    if (lowStock.length > 0) {
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' });

      const alerts = lowStock.map(stock => {
        return Promise.all(
          admins.map(admin => 
            sendEmail({
              email: admin.email,
              subject: 'Low Blood Stock Alert',
              html: emailTemplates.lowStockAlert(stock.bloodGroup, stock.units),
            })
          )
        );
      });

      await Promise.all(alerts);
      console.log('Low stock alerts sent to admins');
    }
  } catch (error) {
    console.error('Low stock alert error:', error);
  }
};

// Send donation confirmation
exports.sendDonationConfirmation = async (donorId, bloodGroup) => {
  try {
    const donor = await Donor.findById(donorId).populate('user', 'name email');
    
    if (donor && donor.user && donor.user.email) {
      const date = new Date().toLocaleDateString();
      await sendEmail({
        email: donor.user.email,
        subject: 'Thank You for Your Blood Donation',
        html: emailTemplates.donationConfirmation(donor.user.name, bloodGroup, date),
      });
    }
  } catch (error) {
    console.error('Donation confirmation error:', error);
  }
};
