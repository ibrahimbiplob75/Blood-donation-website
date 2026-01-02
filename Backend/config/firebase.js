const admin = require('firebase-admin');

const initializeFirebase = () => {
  try {
    const serviceAccount = require('../firebase-service-account.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });

    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
};

module.exports = { admin, initializeFirebase };
