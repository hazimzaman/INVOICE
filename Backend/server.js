const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

console.log('Environment check:', {
  hasUrl: !!process.env.SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
});

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Supabase with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  db: {
    schema: 'public'
  }
});

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
    
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    console.log('Verification details:', {
      email,
      name,
      verificationToken,
      verificationLink
    });
    
    // Test SMTP connection first
    await transporter.verify();
    console.log('SMTP connection verified');

    // Send the verification email
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Verify Your Email - InvoiceApp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563EB;">Welcome to InvoiceApp!</h1>
          <p>Hi ${name},</p>
          <p>Please verify your email by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #2563EB; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      `
    });

    console.log('Verification email sent:', info.messageId);
    res.json({ success: true, messageId: info.messageId });

  } catch (error) {
    console.error('Failed to send verification email:', error);
    res.status(500).json({ 
      error: 'Failed to send verification email',
      details: error.message 
    });
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
    const { email } = req.body;
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      debug: true
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Test Email',
      html: '<p>This is a test email</p>'
    });

    console.log('Test email sent:', info);
    res.json({ message: 'Test email sent successfully', info });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email', details: error.message });
  }
});

// Request password reset
app.post('/api/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Password reset requested for:', email);

    // First check if user exists
    const { data: userData, error: userError } = await supabase
      .from('unverified_users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.log('User not found:', email);
      // Don't reveal if user exists
      return res.json({ message: 'If an account exists, a reset link will be sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Store reset token in database
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: userData.id,
        token: resetToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });

    if (tokenError) {
      console.error('Error storing reset token:', tokenError);
      throw new Error('Failed to process reset request');
    }

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send email using existing transporter
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Reset Your Password - Invoice App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #2563eb; margin: 0; font-size: 24px;">Reset Your Password</h2>
          </div>

          <div style="margin-bottom: 30px;">
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hello ${userData.name},<br><br>
              We received a request to reset your password. Click the button below to set a new password:
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${resetLink}" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>

          <div style="margin-bottom: 30px;">
            <p style="font-size: 14px; line-height: 1.6; color: #64748b;">
              If you didn't request this password reset, you can safely ignore this email.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #64748b;">
              For security, this link will expire in 24 hours.
            </p>
          </div>
        </div>
      `
    });

    console.log('Reset email sent:', info.messageId);
    res.json({ message: 'If an account exists, a reset link will be sent.' });

  } catch (error) {
    console.error('Error in password reset:', error);
    res.status(500).json({ error: 'Failed to process reset request' });
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

// Add this endpoint to handle email verification
app.post('/api/verify-email', async (req, res) => {
  try {
    const { token, password } = req.body;
    console.log('Starting verification process for token:', token);

    // Check if token exists
    if (!token) {
      throw new Error('No verification token provided');
    }

    // Check if password exists
    if (!password) {
      throw new Error('No password provided');
    }

    // Get user from unverified_users with detailed logging
    const { data: userData, error: fetchError } = await supabase
      .from('unverified_users')
      .select('*')
      .eq('verification_token', token)
      .single();

    console.log('Database query result:', {
      hasData: !!userData,
      error: fetchError,
      tokenUsed: token,
      userEmail: userData?.email
    });

    if (fetchError) {
      console.error('Database error:', fetchError);
      throw new Error(`Database error: ${fetchError.message}`);
    }

    if (!userData) {
      throw new Error('No user found with this verification token');
    }

    if (userData.verified) {
      throw new Error('Email already verified');
    }

    // Create verified user in Supabase auth
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email: userData.email,
      password: password, // Use the actual password for auth
      options: {
        data: {
          name: userData.name,
          password_uuid: userData.password_uuid // Store UUID reference
        }
      }
    });

    if (signupError) {
      console.error('Auth signup error:', signupError);
      throw new Error('Failed to create account');
    }

    // Update unverified_users record
    const { error: updateError } = await supabase
      .from('unverified_users')
      .update({ 
        verified: true,
        user_id: authData.user.id
      })
      .eq('verification_token', token);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Failed to verify email');
    }

    res.json({ 
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Detailed verification error:', {
      message: error.message,
      stack: error.stack,
      originalError: error
    });
    
    res.status(500).json({ 
      error: 'Verification failed',
      details: error.message,
      type: error.constructor.name
    });
  }
});

// Add a test route to verify Supabase connection
app.get('/api/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('unverified_users')
      .select('*')
      .limit(1);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new endpoint for sending invoice emails
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, attachments } = req.body;
    
    console.log('Received email request:', {
      to,
      subject,
      hasHtml: !!html,
      hasAttachments: !!attachments
    });

    // Validate required fields
    if (!to) {
      throw new Error('Recipient email is required');
    }
    if (!subject) {
      throw new Error('Email subject is required');
    }
    if (!html) {
      throw new Error('Email content is required');
    }

    // Send the email
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments ? [
        {
          filename: 'invoice.pdf',
          content: attachments,
          encoding: 'base64'
        }
      ] : []
    });

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: to,
      subject: subject
    });

    res.json({ 
      success: true, 
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
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