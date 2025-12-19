import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    // For development, use ethereal.email or test account
    // For production, configure with real SMTP settings
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
  }

  async sendPasswordResetEmail(email, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Taplop Laptop Store" <noreply@taplop.com>',
        to: email,
        subject: 'Password Reset Request - Taplop Laptop Store',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #4f46e5; margin-bottom: 10px;">Taplop Laptop Store</h2>
              <h1 style="color: #2d3748; margin-bottom: 5px;">Password Reset</h1>
            </div>
            
            <div style="background: #f7fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hello,
              </p>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                You requested a password reset for your account. Click the button below to reset your password:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(90deg, #4f46e5, #7c3aed); 
                          color: white; 
                          padding: 12px 30px; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          font-weight: 600;
                          display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                Or copy and paste this link in your browser:
              </p>
              <p style="background: #e2e8f0; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 14px;">
                ${resetUrl}
              </p>
            </div>
            
            <div style="text-align: center; color: #718096; font-size: 14px;">
              <p style="margin-bottom: 10px;">
                This link will expire in 1 hour for security reasons.
              </p>
              <p style="margin-bottom: 10px;">
                If you didn't request this password reset, please ignore this email.
              </p>
              <p>
                © 2024 Taplop Laptop Store. All rights reserved.
              </p>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}

export default new EmailService();
