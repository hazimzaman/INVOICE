const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate verification token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Example API endpoints
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email }])
      .select();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/send-verification', async (req, res) => {
  try {
    const { email, name, verificationToken } = req.body;
    
    console.log('Received verification request:', { email, name, verificationToken });
    
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    // Verify SMTP connection
    await transporter.verify();
    console.log('SMTP connection verified');

    // Send verification email
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563EB; margin-bottom: 24px;">Welcome to InvoiceApp!</h1>
          
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
            Hi ${name},
          </p>
          
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
            Thank you for signing up. Please verify your email address by clicking the button below:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationLink}" 
               style="background-color: #2563EB; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      font-weight: bold;">
              Verify Email Address
            </a>
          </div>

          <p style="color: #6B7280; font-size: 14px; margin-top: 24px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log('Email sent successfully:', info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Email error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to send verification email', details: error.message });
  }
});

// Test email route
app.post('/api/test-email', async (req, res) => {
  try {
    await transporter.sendMail({
      from: 'hazimzaman@primocreators.com',
      to: 'shahsuleman0077@gmail.com',
      subject: 'Test Email from InvoiceApp',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Test Email</h1>
          <p>This is a test email to verify SMTP configuration.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/test-smtp', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    console.log('SMTP connection successful');

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: req.body.email,
      subject: 'SMTP Test',
      html: '<h1>SMTP Test Email</h1><p>If you receive this, SMTP is working correctly.</p>',
    });

    console.log('Test email sent:', info);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('SMTP test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 