const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email
exports.sendEmail = async (options) => {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: options.html || options.text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

// Email templates
exports.emailTemplates = {
  welcome: (name) => `
    <h1>Welcome to Blood Donation Management System</h1>
    <p>Dear ${name},</p>
    <p>Thank you for registering as a blood donor. Your contribution can save lives!</p>
    <p>Best regards,<br>Blood Donation Team</p>
  `,
  
  bloodRequest: (donorName, bloodGroup, hospital) => `
    <h1>Blood Donation Request</h1>
    <p>Dear ${donorName},</p>
    <p>There is an urgent need for ${bloodGroup} blood at ${hospital}.</p>
    <p>If you are available and eligible, please contact us or visit the hospital.</p>
    <p>Thank you for your willingness to save lives!</p>
  `,
  
  donationConfirmation: (donorName, bloodGroup, date) => `
    <h1>Thank You for Your Donation</h1>
    <p>Dear ${donorName},</p>
    <p>Thank you for donating ${bloodGroup} blood on ${date}.</p>
    <p>Your generous contribution has helped save lives!</p>
    <p>You will be eligible to donate again after 90 days.</p>
  `,
  
  lowStockAlert: (bloodGroup, currentStock) => `
    <h1>Low Blood Stock Alert</h1>
    <p>Warning: ${bloodGroup} blood stock is running low!</p>
    <p>Current stock: ${currentStock} units</p>
    <p>Please arrange for blood collection drives or contact available donors.</p>
  `,
};
