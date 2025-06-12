const nodemailer = require('nodemailer');

// Create test account for debugging
async function createTestAccount() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test account created:', testAccount);
    return testAccount;
  } catch (error) {
    console.error('Failed to create test account:', error);
    throw error;
  }
}

// Create transporter with Zoho SMTP settings
const createTransporter = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: true
      }
    });

    // Test the connection
    await transporter.verify();
    console.log('Email server connection verified');
    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    throw error;
  }
};

// Export the function to create the transporter
module.exports = { createTransporter }; 