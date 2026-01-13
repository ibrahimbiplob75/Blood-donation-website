const mongoose = require('mongoose');
require('dotenv').config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    
    const User = require('./models/User');
    const BloodStock = require('./models/BloodStock');
    
    const eligibilityDate = new Date();
    eligibilityDate.setDate(eligibilityDate.getDate() - 120);
    
    console.log('=== ELIGIBILITY CHECK ===');
    console.log('Cutoff date (120 days ago):', eligibilityDate.toISOString().split('T')[0]);
    console.log('\n=== USERS ===');
    
    const users = await User.find({ bloodGroup: { $exists: true } }).select('name lastDonateDate bloodGroup district');
    
    let eligibleCount = 0;
    users.forEach(user => {
      const isEligible = !user.lastDonateDate || new Date(user.lastDonateDate) <= eligibilityDate;
      if (isEligible) eligibleCount++;
      
      let daysSince = 'Never donated';
      if (user.lastDonateDate) {
        daysSince = Math.floor((Date.now() - new Date(user.lastDonateDate)) / (1000 * 60 * 60 * 24)) + ' days';
      }
      
      console.log(`${user.name} (${user.bloodGroup}, ${user.district})`);
      console.log(`  Last: ${user.lastDonateDate ? user.lastDonateDate.toISOString().split('T')[0] : 'Never'}`);
      console.log(`  Since: ${daysSince}`);
      console.log(`  Status: ${isEligible ? '✓ Eligible' : '✗ Not eligible'}\n`);
    });
    
    console.log(`\nTotal: ${users.length} donors`);
    console.log(`Eligible: ${eligibleCount} donors`);
    
    console.log('\n=== BLOOD STOCK ===');
    const stocks = await BloodStock.find({}).sort({ bloodGroup: 1 });
    stocks.forEach(stock => {
      console.log(`${stock.bloodGroup}: ${stock.units} units`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkData();
