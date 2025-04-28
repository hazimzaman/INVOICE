interface EmailParams {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: string;
  }>;
}

export const sendEmail = async (params: EmailParams): Promise<void> => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const getPasswordResetEmailContent = (resetLink: string) => {
  return {
    subject: 'Reset Your Invoice App Password',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a56db; margin-bottom: 20px;">Reset Your Password</h2>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          Hello,
        </p>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          We received a request to reset your password for your Invoice App account. If you didn't make this request, you can safely ignore this email.
        </p>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
          To reset your password, click the button below:
        </p>
        
        <a href="${resetLink}" 
           style="display: inline-block; background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-bottom: 30px;">
          Reset Password
        </a>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          This link will expire in 24 hours for security reasons.
        </p>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          If you're having trouble clicking the button, copy and paste this URL into your browser:
          <br>
          <span style="color: #1a56db;">${resetLink}</span>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          If you didn't request a password reset, please ignore this email or contact support if you have concerns.
        </p>
      </div>
    `
  };
}; 