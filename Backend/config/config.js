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
require('dotenv').config();

function setupMiddleware(app) {
  app.use(helmet());
  app.use(express.json({limit: '30mb'}));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));
  app.use(cookieParser(process.env.COOKIE_SECRET));

  const corsOptions = {
    origin: [
      'https://rmcrotaract.org',
      'https://www.rmcrotaract.org',
      // 'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
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
}

module.exports = { setupMiddleware };