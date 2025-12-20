import express from "express";
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
} from "../controllers/orderController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/roleMiddleware.js";
import {
  validateOrderCreate,
  validateStatusUpdate,
  validateOrderId
} from "../middlewares/validateOrder.js";

const router = express.Router();

// User routes (authenticated)
router.post("/",
  authMiddleware,
  validateOrderCreate,
  createOrder
);

router.get("/my-orders",
  authMiddleware,
  getMyOrders
);

router.get("/:id",
  authMiddleware,
  validateOrderId,
  getOrderById
);

router.delete("/:id",
  authMiddleware,
  validateOrderId,
  cancelOrder
);

// Admin routes
router.get("/",
  authMiddleware,
  requireAdmin,
  getAllOrders
);

router.get("/admin/stats",
  authMiddleware,
  requireAdmin,
  getOrderStats
);

router.patch("/:id/status",
  authMiddleware,
  requireAdmin,
  validateOrderId,
  validateStatusUpdate,
  updateOrderStatus
);

export default router;
