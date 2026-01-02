const cors = require('cors');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const xlsx = require('xlsx');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const { get } = require('http');
require('dotenv').config();

function setupMiddleware(app) {
  app.use(helmet());
  app.use(express.json({limit: '30mb'}));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));
  app.use(cookieParser(process.env.COOKIE_SECRET));
  
  const corsOptions = {
    origin: [
      'https://blood-management-rmc.web.app',
      'https://rupdhara-bd.web.app',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));
  app.use(compression());
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    message: 'Too many requests from this IP, please try again later'
  });
  app.use(limiter);

  const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  }
  });
  
  return { csrfProtection };
}

module.exports = { setupMiddleware };