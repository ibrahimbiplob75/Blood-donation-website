const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You need to download service account key from Firebase Console
// Project Settings > Service Accounts > Generate New Private Key

const serviceAccount = require('../services/blood_firebase_api.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;