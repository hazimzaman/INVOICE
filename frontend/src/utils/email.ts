interface EmailAttachment {
  filename: string;
  content: string;
  encoding: string;
  type: string;
}

interface EmailParams {
  to: string;
  subject: string;
  body: string;
  from: string;
  attachment?: EmailAttachment;
}

export const sendEmail = async (params: EmailParams) => {
  try {
    console.log('Sending email with params:', {
      to: params.to,
      subject: params.subject,
      hasAttachment: !!params.attachment,
      attachmentName: params.attachment?.filename
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

export const getPasswordResetEmailContent = (resetLink: string) => {
  return {
    subject: 'Reset Your Invoice App Password',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #2563eb; margin: 0; font-size: 24px;">Reset Your Password</h2>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your Invoice App account. 
            Click the button below to reset your password:
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

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">
            This is an automated email from Invoice App. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  };
}; 