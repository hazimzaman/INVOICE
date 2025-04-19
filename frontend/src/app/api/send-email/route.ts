import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { SentMessageInfo } from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false // Only if you have SSL certificate issues
  }
});

interface EmailAttachment {
  filename: string;
  content: string;  // Base64 string
}

export async function POST(request: Request) {
  try {
    const { to, subject, body, attachments }: { 
      to: string;
      subject: string;
      body: string;
      attachments?: EmailAttachment[];
    } = await request.json();

    const mailOptions = {
      from: {
        name: 'Invoice System',
        address: process.env.SMTP_FROM_EMAIL!
      },
      to,
      subject,
      html: body,
      attachments: attachments?.map(attachment => ({
        filename: attachment.filename,
        content: Buffer.from(attachment.content, 'base64'),
        encoding: 'base64'
      }))
    };

    const info = await transporter.sendMail(mailOptions) as SentMessageInfo;
    console.log('Email sent successfully:', info.messageId);
    
    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 