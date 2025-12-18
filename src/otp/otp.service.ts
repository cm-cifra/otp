import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OtpService {
  private otpStore = new Map<string, { otp: string; expiresAt: number }>();

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // your gmail
      pass: process.env.GMAIL_APP_PASSWORD, // app password
    },
  });

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email: string) {
  const otp = this.generateOtp();

  await this.transporter.sendMail({
    from: `"OTP Service" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    html: `
      <h2>Your OTP Code</h2>
      <p><b>${otp}</b></p>
      <p>This code will expire in 5 minutes.</p>
    `,
  });

  return {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };
}


  verifyOtp(email: string, otp: string) {
    const data = this.otpStore.get(email);

    if (!data) {
      return { valid: false, message: 'OTP not found' };
    }

    if (Date.now() > data.expiresAt) {
      this.otpStore.delete(email);
      return { valid: false, message: 'OTP expired' };
    }

    if (data.otp !== otp) {
      return { valid: false, message: 'Invalid OTP' };
    }

    this.otpStore.delete(email);
    return { valid: true, message: 'OTP verified successfully' };
  }
}
