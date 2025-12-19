import OrderService from "../services/orderService.js";
import logger from "../utils/logger.js";

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required"
      });
    }

    const order = await OrderService.createOrder(userId, {
      items,
      shippingAddress
    });

    logger.info(`Order created by user ${userId}: ${order._id}`);

    return res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    logger.error("Error in createOrder: " + error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/orders/my
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await OrderService.getMyOrders(userId);

    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    logger.error("Error in getMyOrders: " + error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;
    
    const order = await OrderService.getOrderById(orderId, userId);

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    logger.error("Error in getOrderById: " + error.message);
    const statusCode = error.message === "Order not found" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};
