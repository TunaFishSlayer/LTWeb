import UserService from "../services/userService.js";
import logger from "../utils/logger.js";

export const searchUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await UserService.getUserByEmail(email);
    
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error("Error in searchUserByEmail: " + error.message);
    const statusCode = error.message === "User not found" ? 404 : 500;
    return res.status(statusCode).json({ 
      success: false,
      message: error.message
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    
    return res.status(200).json({
      success: true,
      total: users.length,
      data: users
    });
  } catch (error) {
    logger.error("Error in getAllUsers: " + error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account"
      });
    }
    
    await UserService.deleteUser(id);
    
    logger.info(`User ${id} deleted by admin ${req.user.userId}`);
    
    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    logger.error("Error in deleteUser: " + error.message);
    const statusCode = error.message === "User not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
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

// Admin updates any user
export const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const user = await UserService.updateUser(id, updateData);
    
    logger.info(`User ${id} updated by admin ${req.user.userId}`);
    
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } catch (error) {
    logger.error("Error in updateUserByAdmin: " + error.message);
    const statusCode = error.message === "User not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};