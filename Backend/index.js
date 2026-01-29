const express = require('express');
const mongoose = require('mongoose');
const { setupMiddleware } = require('./config/config');
const { connectToDatabase, isConnectionReady } = require('./config/database');
const { checkAndUpdateActiveDonar } = require('./utils/helpers');
const { startAvailabilityScheduler } = require('./utils/updateAvailabilityScheduler');
const { initializeBlacklistService } = require('./services/tokenBlacklistService');
require('dotenv').config();

const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/Authroutes');
const bloodRequestRoutes = require('./routes/Bloodrequest');
const bloodStockRoutes = require('./routes/bloodStockRoutes');
const donationRequestRoutes = require('./routes/donationRequest');
const donorRoutes = require('./routes/donor');

const { loginAdmin, verifyAdminToken } = require('./services/authService');
const { generateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5001;

const { csrfProtection } = setupMiddleware(app);
app.use(async (req, res, next) => {
  if (!isConnectionReady()) {
    try {
      console.log('Database not ready, attempting to connect...');
      await connectToDatabase();
      
    } catch (error) {
      console.error('Database connection failed in middleware:', error);
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Service temporarily unavailable'
      });
    }
  }
  next();
});


app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});


app.post('/admin/login', csrfProtection, loginAdmin);

app.post('/jwt', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const token = generateToken({
      authenticated: true,
      user: true,
      email: email.trim().toLowerCase(),
    });

    return res.json({ token });
  } catch (error) {
    console.error('Error issuing JWT for user:', error);
    return res.status(500).json({ error: 'Failed to create token' });
  }
});


app.get('/admin/verify-token', verifyAdminToken);

app.post('/admin/logout', (req, res) => {
  res.clearCookie('AccessToken');
  res.clearCookie('adminToken');
  res.json({ success: true, message: "Logged out successfully" });
});

app.use('/', adminRoutes);
app.use('/', userRoutes);
app.use('/', bloodRequestRoutes);
app.use('/', bloodStockRoutes);
app.use('/', donationRequestRoutes);
app.use('/donor', donorRoutes);

app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'CSRF token invalid' });
  }
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.get('/', (req, res) => {
  res.send('Blood Donation backend is ready');
});

async function startServer() {
  try {
    // Connect Mongoose for model operations
    if (!mongoose.connection.readyState) {
      console.log('Connecting to MongoDB via Mongoose...');
      await mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('Mongoose connection successful');
    }
    
    await connectToDatabase();
    
    // Initialize token blacklist service
    initializeBlacklistService();
    
    startAvailabilityScheduler();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });


  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();