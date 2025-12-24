import OrderService from "../services/orderService.js";
import logger from "../utils/logger.js";

// USER - POST /api/orders (authenticated users can create orders)
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const orderData = req.body;

    const order = await OrderService.createOrder(userId, orderData);

    logger.info(`Order created by user ${userId}`);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order
    });
  } catch (error) {
    logger.error("Error in createOrder: " + error.message);

    if (error.message.includes('not found') || error.message.includes('Insufficient')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
};

// ADMIN - GET /api/orders (admin can see all orders)
export const getAllOrders = async (req, res) => {
  try {
    const { orders, pagination } = await OrderService.getAllOrders(req.query);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination
    });
  } catch (error) {
    logger.error("Error in getAllOrders: " + error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// USER - GET /api/orders/my-orders (user sees their own orders)
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orders, pagination } = await OrderService.getUserOrders(userId, req.query);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination
    });
  } catch (error) {
    logger.error("Error in getMyOrders: " + error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// USER/ADMIN - GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await OrderService.getOrderById(req.params.id);

    // Users can only see their own orders, admins can see all
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only view your own orders"
      });
    }

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

// ADMIN - PATCH /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await OrderService.updateOrderStatus(req.params.id, status);

    logger.info(`Order ${req.params.id} status updated to ${status} by admin ${req.user.userId}`);

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order
    });
  } catch (error) {
    logger.error("Error in updateOrderStatus: " + error.message);
    const statusCode = error.message === "Order not found" ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// USER - DELETE /api/orders/:id (users can cancel their own pending orders)
export const cancelOrder = async (req, res) => {
  try {
    const order = await OrderService.getOrderById(req.params.id);

    // Users can only cancel their own orders
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only cancel your own orders"
      });
    }

    const deletedOrderId = await OrderService.cancelOrder(req.params.id);

    logger.info(`Order ${req.params.id} cancelled by user ${req.user.userId}`);

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully"
    });
  } catch (error) {
    logger.error("Error in cancelOrder: " + error.message);

    if (error.message === "Order not found") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Cannot cancel')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to cancel order"
    });
  }
};

