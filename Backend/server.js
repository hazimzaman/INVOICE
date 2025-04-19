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

// Request password reset
app.post('/api/request-password-reset', async (req, res) => {
  try {
    const { email, name } = req.body;
    console.log('Received reset request for:', { email, name });

    // First check unverified_users to ensure user is verified
    const { data: userData, error: userError } = await supabase
      .from('unverified_users')
      .select('*')
      .eq('email', email)
      .eq('name', name)
      .eq('verified', true)
      .single();

    if (userError || !userData) {
      console.log('User not found or not verified');
      return res.json({ success: true }); // Security through obscurity
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Store reset token in Supabase
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: userData.id,
        token: resetToken,
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
      });

    if (tokenError) {
      console.error('Token storage error:', tokenError);
      throw tokenError;
    }

    // Send reset email using our SMTP
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Reset Your Password - InvoiceApp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563EB; margin-bottom: 24px;">Reset Your Password</h1>
          
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
            Hi ${name},
          </p>
          
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
            We received a request to reset your password. Click the button below to set a new password:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
               style="background-color: #2563EB; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      font-weight: bold;">
              Reset Password
            </a>
          </div>

          <p style="color: #6B7280; font-size: 14px; margin-top: 24px;">
            If you didn't request this password reset, you can safely ignore this email.
            The link will expire in 1 hour.
          </p>
        </div>
      `
    });

    console.log('Reset email sent successfully');
    res.json({ success: true });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      error: 'Failed to process password reset request',
      details: error.message 
    });
  }
});

// Reset password
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Get reset token and user data
    const { data: resetData, error: resetError } = await supabase
      .from('password_reset_tokens')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    if (resetError || !resetData) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (new Date(resetData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('unverified_users')
      .select('*')
      .eq('id', resetData.user_id)
      .single();

    if (userError || !userData) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Update password in unverified_users table
    const { error: updateError } = await supabase
      .from('unverified_users')
      .update({ password: newPassword })
      .eq('id', resetData.user_id);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

    // Try to create/update auth user
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: newPassword,
        options: {
          data: { name: userData.name }
        }
      });

      if (signUpError && !signUpError.message.includes('User already registered')) {
        throw signUpError;
      }
    } catch (error) {
      console.error('Auth operation error:', error);
      // Continue since we've updated the password in unverified_users
    }

    // Delete used token
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('token', token);

    res.json({ 
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      error: 'Failed to reset password',
      details: error.message 
    });
  }
});

// Verify email endpoint
app.post('/api/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Get user data from unverified_users
    const { data: userData, error: fetchError } = await supabase
      .from('unverified_users')
      .select('*')
      .eq('verification_token', token)
      .eq('verified', false)
      .single();

    if (fetchError || !userData) {
      throw new Error('Invalid or expired verification token');
    }

    // Create auth user in Supabase
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name
        }
      }
    });

    if (signupError) {
      throw new Error('Failed to create auth account');
    }

    // Update unverified_users record
    const { error: updateError } = await supabase
      .from('unverified_users')
      .update({ verified: true })
      .eq('verification_token', token);

    if (updateError) {
      throw new Error('Failed to verify email');
    }

    res.json({ 
      success: true,
      message: 'Email verified successfully. Please login.'
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify email',
      details: error.message 
    });
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