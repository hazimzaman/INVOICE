interface EmailAttachment {
  filename: string;
  content: string;
}

export async function sendEmail({ 
  to, 
  subject, 
  body, 
  attachments 
}: { 
  to: string; 
  subject: string; 
  body: string; 
  attachments?: EmailAttachment[];
}) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body, attachments }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
} 