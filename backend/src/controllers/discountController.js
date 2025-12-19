import DiscountService from "../services/discountService.js";
import logger from "../utils/logger.js";

// ADMIN - GET /api/discounts
export const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await DiscountService.getAllDiscounts();
    return res.status(200).json({
      success: true,
      data: discounts
    });
  } catch (error) {
    logger.error("Error in getAllDiscounts: " + error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// PUBLIC - GET /api/discounts/active
export const getActiveDiscounts = async (req, res) => {
  try {
    const discounts = await DiscountService.getActiveDiscounts();
    return res.status(200).json({
      success: true,
      data: discounts
    });
  } catch (error) {
    logger.error("Error in getActiveDiscounts: " + error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ADMIN - GET /api/discounts/:id
export const getDiscountById = async (req, res) => {
  try {
    const discount = await DiscountService.getDiscountById(req.params.id);
    return res.status(200).json({
      success: true,
      data: discount
    });
  } catch (error) {
    logger.error("Error in getDiscountById: " + error.message);
    const statusCode = error.message === "Discount not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// ADMIN - POST /api/discounts
export const createDiscount = async (req, res) => {
  try {
    const discount = await DiscountService.createDiscount(req.body);
    logger.info(`Discount created by admin ${req.user.userId}: ${discount._id}`);
    return res.status(201).json({
      success: true,
      data: discount
    });
  } catch (error) {
    logger.error("Error in createDiscount: " + error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ADMIN - PUT /api/discounts/:id
export const updateDiscount = async (req, res) => {
  try {
    const discount = await DiscountService.updateDiscount(req.params.id, req.body);
    logger.info(`Discount ${req.params.id} updated by admin ${req.user.userId}`);
    return res.status(200).json({
      success: true,
      data: discount
    });
  } catch (error) {
    logger.error("Error in updateDiscount: " + error.message);
    const statusCode = error.message === "Discount not found" ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// ADMIN - DELETE /api/discounts/:id
export const deleteDiscount = async (req, res) => {
  try {
    await DiscountService.deleteDiscount(req.params.id);
    logger.info(`Discount ${req.params.id} deleted by admin ${req.user.userId}`);
    return res.status(200).json({
      success: true,
      message: "Discount deleted"
    });
  } catch (error) {
    logger.error("Error in deleteDiscount: " + error.message);
    const statusCode = error.message === "Discount not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

