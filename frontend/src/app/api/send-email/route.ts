import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { SentMessageInfo } from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true, // Use SSL/TLS for port 465
  auth: {
    user: 'hazimzaman@primocreators.com',
    pass: '(Byebye123)@',
  },
  tls: {
    rejectUnauthorized: true
  }
});

export async function POST(request: Request) {
  try {
    const { to, subject, body, attachments } = await request.json();

    // Validate required fields
    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const mailOptions = {
      from: {
        name: 'Invoice System',
        address: 'hazimzaman@primocreators.com'
      },
      to,
      subject,
      html: body,
      attachments: attachments?.map((attachment: any) => ({
        filename: attachment.filename,
        content: Buffer.from(attachment.content, 'base64'),
        encoding: 'base64'
      }))
    };

    const info = await transporter.sendMail(mailOptions) as SentMessageInfo;
    
    return NextResponse.json({ 
      message: 'Email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 