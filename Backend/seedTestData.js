const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const BloodStock = require('./models/BloodStock');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to database');

    // Sample users based on your schema
    const users = [
      {
        name: 'Md Tanvir',
        email: 'tanvir@gmail.com',
        phone: '01987654321',
        password: 'test1234',
        bloodGroup: 'B+',
        district: 'Dhaka',
        lastDonateDate: new Date('2025-11-25'), // More than 120 days ago from current date
        role: 'Admin',
        bloodGiven: 0,
        bloodTaken: 0,
      },
      {
        name: 'Ahmed Khan',
        email: 'ahmed@gmail.com',
        phone: '01712345678',
        password: 'test1234',
        bloodGroup: 'O+',
        district: 'Dhaka',
        lastDonateDate: new Date('2025-12-20'), // Recent donation
        role: 'donor',
        bloodGiven: 2,
        bloodTaken: 0,
      },
      {
        name: 'Fatima Rahman',
        email: 'fatima@gmail.com',
        phone: '01823456789',
        password: 'test1234',
        bloodGroup: 'A+',
        district: 'Chittagong',
        lastDonateDate: new Date('2025-09-15'), // More than 120 days ago
        role: 'donor',
        bloodGiven: 3,
        bloodTaken: 0,
      },
      {
        name: 'Rahim Islam',
        email: 'rahim@gmail.com',
        phone: '01934567890',
        password: 'test1234',
        bloodGroup: 'AB+',
        district: 'Sylhet',
        lastDonateDate: null, // Never donated, eligible
        role: 'donor',
        bloodGiven: 0,
        bloodTaken: 0,
      },
      {
        name: 'Sadia Begum',
        email: 'sadia@gmail.com',
        phone: '01645678901',
        password: 'test1234',
        bloodGroup: 'O-',
        district: 'Dhaka',
        lastDonateDate: new Date('2025-08-10'), // More than 120 days ago
        role: 'donor',
        bloodGiven: 1,
        bloodTaken: 0,
      },
      {
        name: 'Karim Hossain',
        email: 'karim@gmail.com',
        phone: '01756789012',
        password: 'test1234',
        bloodGroup: 'A-',
        district: 'Rajshahi',
        lastDonateDate: new Date('2025-10-20'), // More than 120 days ago
        role: 'donor',
        bloodGiven: 4,
        bloodTaken: 0,
      },
      {
        name: 'Nusrat Jahan',
        email: 'nusrat@gmail.com',
        phone: '01867890123',
        password: 'test1234',
        bloodGroup: 'B-',
        district: 'Chittagong',
        lastDonateDate: new Date('2026-01-10'), // Recent, not eligible
        role: 'donor',
        bloodGiven: 0,
        bloodTaken: 0,
      },
      {
        name: 'Habib Ahmed',
        email: 'habib@gmail.com',
        phone: '01978901234',
        password: 'test1234',
        bloodGroup: 'AB-',
        district: 'Khulna',
        lastDonateDate: null, // Never donated, eligible
        role: 'donor',
        bloodGiven: 0,
        bloodTaken: 0,
      }
    ];

    // Clear existing users (optional, comment out if you want to keep existing data)
    // await User.deleteMany({ email: { $in: users.map(u => u.email) } });
    
    console.log('Inserting users...');
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${userData.name} (${userData.email})`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    // Sample blood stock data
    const bloodStocks = [
      { bloodGroup: 'A+', units: 25 },
      { bloodGroup: 'A-', units: 8 },
      { bloodGroup: 'B+', units: 30 },
      { bloodGroup: 'B-', units: 6 },
      { bloodGroup: 'AB+', units: 12 },
      { bloodGroup: 'AB-', units: 4 },
      { bloodGroup: 'O+', units: 45 },
      { bloodGroup: 'O-', units: 10 },
    ];

    console.log('\nInserting blood stock data...');
    for (const stockData of bloodStocks) {
      const existingStock = await BloodStock.findOne({ bloodGroup: stockData.bloodGroup });
      if (!existingStock) {
        await BloodStock.create(stockData);
        console.log(`Created blood stock: ${stockData.bloodGroup} - ${stockData.units} units`);
      } else {
        existingStock.units = stockData.units;
        await existingStock.save();
        console.log(`Updated blood stock: ${stockData.bloodGroup} - ${stockData.units} units`);
      }
    }

    console.log('\n✅ Seed data inserted successfully!');
    console.log('\nSummary:');
    console.log(`- Users inserted: ${users.length}`);
    console.log(`- Blood types: ${bloodStocks.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
