const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { createTransporter } = require('./src/config/email');
const bcrypt = require('bcrypt');
require('dotenv').config();

console.log('Environment check:', {
  hasUrl: !!process.env.SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
});

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize Supabase with service role key
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  db: {
    schema: 'public'
  }
});

// Log the initialization
console.log('Supabase client initialized with:', {
  url: process.env.SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
});

// Initialize email transporter
let emailTransporter;
(async () => {
  try {
    emailTransporter = await createTransporter();
    console.log('Email transporter initialized');
  } catch (error) {
    console.error('Failed to initialize email transporter:', error);
  }
})();

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
    const { email, name, password } = req.body;
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Store raw password temporarily
    const { data: tempPassword, error: tempPasswordError } = await supabase
      .from('temp_passwords')
      .insert({ password: password })
      .select()
      .single();

    if (tempPasswordError) {
      throw new Error('Failed to store temporary password');
    }

    // Create unverified user
    const { error: userError } = await supabase
      .from('unverified_users')
      .insert({
        email,
        name,
        verification_token: verificationToken,
        password_id: tempPassword.id
      });

    if (userError) {
      throw userError;
    }

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;
    const info = await emailTransporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Verify your email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Welcome to Our App!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for signing up. Please verify your email by clicking the link below:</p>
          <p>
            <a href="${verificationUrl}" 
               style="display: inline-block; padding: 10px 20px; 
                      background-color: #4F46E5; color: white; 
                      text-decoration: none; border-radius: 5px;">
              Verify Email
            </a>
          </p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `
    });

    res.json({ 
      success: true,
      message: 'Verification email sent',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Failed to process signup',
      details: error.message
    });
  }
});

// Test email route
app.post('/api/test-email', async (req, res) => {
  try {
    await emailTransporter.sendMail({
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

    const info = await emailTransporter.sendMail({
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
    const info = await emailTransporter.sendMail({
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

// Add this function to create a verified user
async function createVerifiedUser(email, name, passwordId) {
  try {
    // Get the raw password
    const { data: passwordData, error: passwordError } = await supabase
      .from('temp_passwords')
      .select('password')
      .eq('id', passwordId)
      .single();

    if (passwordError) {
      console.error('Password fetch error:', passwordError);
      throw new Error('Failed to retrieve password data');
    }

    console.log('Creating auth user for:', email);

    // Create the user in Supabase Auth with raw password
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: passwordData.password, // Using raw password
      email_confirm: true,
      user_metadata: {
        name: name
      }
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      throw authError;
    }

    console.log('Auth user created:', authData.user.id);

    // Create the user in your users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        name: name
      });

    if (userError) {
      console.error('Database user creation error:', userError);
      // Clean up auth user if db insert fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }

    // Clean up temporary password
    await supabase
      .from('temp_passwords')
      .delete()
      .eq('id', passwordId);

    return {
      id: authData.user.id,
      email: email,
      password: passwordData.password // Return raw password for initial sign-in
    };
  } catch (error) {
    console.error('Error creating verified user:', error);
    throw error;
  }
}

// Update the verify-email endpoint
app.post('/api/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    console.log('Processing verification for token:', token);
    
    // Get unverified user data
    const { data: userData, error: userError } = await supabase
      .from('unverified_users')
      .select('*')
      .eq('verification_token', token)
      .eq('verified', false)
      .single();

    if (userError || !userData) {
      console.error('User fetch error:', userError);
      throw new Error('Invalid or expired verification token');
    }

    // Create verified user
    const user = await createVerifiedUser(
      userData.email,
      userData.name,
      userData.password_id
    );

    // Mark as verified
    const { error: updateError } = await supabase
      .from('unverified_users')
      .update({ verified: true })
      .eq('verification_token', token);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Failed to update verification status');
    }

    res.json({ 
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        password: user.password // Send back raw password for initial sign-in
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify email',
      details: error.message 
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
    const info = await emailTransporter.sendMail({
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

// Test email configuration
app.get('/api/test-email-config', async (req, res) => {
  try {
    await emailTransporter.verify();
    
    // Send test email
    const info = await emailTransporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'Test Email',
      text: 'If you receive this, the email configuration is working.'
    });

    res.json({ 
      success: true, 
      message: 'Email configuration is working',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Email configuration test failed:', error);
    res.status(500).json({ 
      error: 'Email configuration test failed',
      details: error.message
    });
  }
});

// Add this near your other test endpoints
app.post('/api/test-email-simple', async (req, res) => {
  try {
    if (!emailTransporter) {
      throw new Error('Email transporter not initialized');
    }

    const testMailOptions = {
      from: process.env.SMTP_USER,
      to: 'shahsuleman0077@gmail.com', // Your test email
      subject: 'Test Email',
      text: 'This is a test email from the system'
    };

    console.log('Attempting to send test email with options:', {
      from: testMailOptions.from,
      to: testMailOptions.to
    });

    const info = await emailTransporter.sendMail(testMailOptions);
    
    console.log('Test email sent successfully:', info);
    res.json({ 
      success: true, 
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Detailed email error:', error);
    res.status(500).json({ 
      error: 'Failed to send test email',
      details: error.message,
      stack: error.stack
    });
  }
});

// Add this test endpoint
app.get('/api/test-db-access', async (req, res) => {
  try {
    // Test user_passwords access
    const { data: passwordTest, error: passwordError } = await supabase
      .from('user_passwords')
      .insert({
        id: crypto.randomUUID(),
        password_hash: 'test_hash'
      })
      .select()
      .single();

    if (passwordError) {
      throw new Error(`Password table error: ${passwordError.message}`);
    }

    // Clean up test data
    await supabase
      .from('user_passwords')
      .delete()
      .eq('id', passwordTest.id);

    res.json({ 
      success: true, 
      message: 'Database access verified'
    });
  } catch (error) {
    console.error('Database access test failed:', error);
    res.status(500).json({ 
      error: 'Database access test failed',
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
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 