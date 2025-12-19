import EmailService from '../services/emailService.js';
import logger from '../utils/logger.js';

export const testEmail = async (req, res) => {
  try {
    logger.info('Testing email configuration...');
    logger.info('EMAIL_USER:', process.env.EMAIL_USER);
    logger.info('EMAIL_PASS configured:', !!process.env.EMAIL_PASS);
    logger.info('FRONTEND_URL:', process.env.FRONTEND_URL);
    
    // Test email service connection
    const connectionTest = await EmailService.testConnection();
    
    if (connectionTest) {
      return res.status(200).json({
        message: "Email service connection successful",
        emailConfigured: !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS,
        emailUser: process.env.EMAIL_USER
      });
    } else {
      return res.status(500).json({
        message: "Email service connection failed",
        emailConfigured: !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS,
        emailUser: process.env.EMAIL_USER
      });
    }
  } catch (error) {
    logger.error('Email test error:', error);
    return res.status(500).json({
      message: "Email test failed",
      error: error.message,
      emailConfigured: !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS,
      emailUser: process.env.EMAIL_USER
    });
  }
};
