import express from "express";
import {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getActiveDiscounts
} from "../controllers/discountController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/roleMiddleware.js";
import { validateMongoId } from "../middlewares/validateLaptop.js";

const router = express.Router();

// Public route - get active discounts
router.get("/active", getActiveDiscounts);

// Admin routes require authentication
router.get("/", authMiddleware, requireAdmin, getAllDiscounts);
router.get("/:id", authMiddleware, requireAdmin, validateMongoId, getDiscountById);
router.post("/", authMiddleware, requireAdmin, createDiscount);
router.put("/:id", authMiddleware, requireAdmin, validateMongoId, updateDiscount);
router.delete("/:id", authMiddleware, requireAdmin, validateMongoId, deleteDiscount);

export default router;

