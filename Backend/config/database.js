const { MongoClient, ServerApiVersion } = require('mongodb');

let client;
let collections = {};
let isConnected = false;

async function connectToDatabase() {
  if (client && isConnected) {
    return collections;
  }

  try {
    console.log('Attempting to connect to database...');
    
    client = new MongoClient(process.env.DB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log('Database connection successful');
    const db = client.db("Blood-DonationDB");
    collections.usersCollection = db.collection("users");
    collections.adminCollection = db.collection("admins");
    collections.bloodRequestsCollection = db.collection('bloodRequests');
    collections.donationRequestsCollection = db.collection('donationRequests');
    collections.bloodStockCollection = db.collection('bloodStock');
    collections.bloodTransactionsCollection = db.collection('bloodTransactions');
    collections.statisticsCollection = db.collection('statistics');
    collections.blacklistedTokensCollection = db.collection('blacklistedTokens');
    
    // Create TTL index on blacklistedTokens collection for automatic cleanup
    try {
      await collections.blacklistedTokensCollection.createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
      );
      console.log('Blacklisted tokens TTL index created');
    } catch (indexError) {
      console.warn('TTL index creation failed (may already exist):', indexError.message);
    }
    

    isConnected = true;
    return collections;
  } catch (error) {
    isConnected = false;
    throw error;
  }
}

function getCollections() {
  if (!isConnected || !collections || Object.keys(collections).length === 0) {
    throw new Error('Database not connected. Call connectToDatabase first.');
  }
  return collections;
}

function isConnectionReady() {
  return isConnected && collections && Object.keys(collections).length > 0;
}

module.exports = { 
  connectToDatabase, 
  getCollections, 
  isConnectionReady 
};