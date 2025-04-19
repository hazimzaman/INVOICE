import { Invoice } from '@/types/invoice';
import { parseEmailTemplate } from '@/utils/emailTemplate';

interface SendEmailProps {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: any;
  }>;
}

export const sendEmail = async ({ to, subject, body, attachments }: SendEmailProps) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        body,
        attachments,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}; 