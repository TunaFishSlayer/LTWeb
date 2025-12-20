import UserService from "../services/userService.js";
import logger from "../utils/logger.js";
import { signToken } from "../utils/role.js";
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import EmailService from '../services/emailService.js';

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const user = await UserService.registerUser({
      email,
      password,
      name
    });

    const token = signToken(user);
    logger.info("New user registered: " + user.email);

    return res.status(201).json({
      message: "User registered successfully",
      user,
      token
    });
  } catch (error) {
    logger.warn("Registration error: " + error.message);
    return res.status(400).json({
      message: error.message
    });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserService.loginLocal({
      email,
      password
    });

    const token = signToken(user);
    logger.info("User logged in: " + user.email);

    return res.status(200).json({
      message: "Login success",
      user,
      token
    });
  } catch (error) {
    logger.warn("Login error: " + error.message);
    return res.status(401).json({
      message: error.message
    });
  }
};

// POST /api/auth/google
export const loginGoogle = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required"
      });
    }

    // Initialize Google OAuth client
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    // Get user data from Google
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    if (!email || !name) {
      return res.status(400).json({
        message: "Invalid Google token: missing email or name"
      });
    }

    const user = await UserService.loginGoogle({
      email,
      name,
      googleId
    });

    const token = signToken(user);
    logger.info("User logged in with Google: " + user.email);

    return res.status(200).json({
      message: "Google login success",
      user,
      token
    });
  } catch (error) {
    logger.warn("Google login error: " + error.message);
    return res.status(400).json({
      message: error.message || "Google login failed"
    });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    // Check if user exists
    const user = await UserService.findUserByEmail(email);
    
    if (!user) {
      // Don't reveal that user doesn't exist for security
      return res.status(200).json({
        message: "If an account with that email exists, a password reset link has been sent."
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set token expiration (1 hour)
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await UserService.setPasswordResetToken(email, resetTokenHash, resetExpires);

    // For testing: return the reset link in response
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    logger.info("Password reset requested for email: " + email);
    logger.info("Reset URL (for testing): " + resetUrl);

    try {
      // Try to send email (will fail with placeholder credentials)
      await EmailService.sendPasswordResetEmail(email, resetToken);
      
      return res.status(200).json({
        message: "If an account with that email exists, a password reset link has been sent.",
        // For testing: include reset URL
        resetUrl: resetUrl
      });
    } catch (emailError) {
      logger.error("Email sending failed, but continuing for testing:", emailError);
      
      // Still return success with reset URL for testing
      return res.status(200).json({
        message: "If an account with that email exists, a password reset link has been sent.",
        // For testing: include reset URL when email fails
        resetUrl: resetUrl
      });
    }
  } catch (error) {
    logger.warn("Forgot password error: " + error.message);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with valid reset token
    const user = await UserService.findUserByResetToken(tokenHash);
    
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }

    // Check if token has expired
    if (user.passwordResetExpires < new Date()) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }

    // Update password and clear reset token
    await UserService.updatePassword(user._id, newPassword);
    
    logger.info("Password reset successful for user: " + user.email);

    return res.status(200).json({
      message: "Password reset successful"
    });
  } catch (error) {
    logger.warn("Reset password error: " + error.message);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// GET /api/auth/me
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await UserService.getUserById(userId);
    logger.info("Fetched profile for userId: " + userId);

    return res.status(200).json({ user });
  } catch (error) {
    logger.warn("Get profile error: " + error.message);
    return res.status(401).json({
      message: "Unauthorized"
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // User updates their own profile
    const { name, phone, address } = req.body;
    
    // Only allow updating specific fields
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    
    const user = await UserService.updateUser(userId, updateData);
    
    logger.info(`User ${userId} updated their profile`);
    
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user
    });
  } catch (error) {
    logger.error("Error in updateUserProfile: " + error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};