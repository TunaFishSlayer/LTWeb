import express from "express";
import {
  getAllLaptops,
  getLaptopById,
  createLaptop,
  updateLaptop,
  deleteLaptop
} from "../controllers/laptopController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/roleMiddleware.js"; 
import { 
  validateLaptopCreate, 
  validateLaptopUpdate,
  validateMongoId 
} from "../middlewares/validateLaptop.js";

const router = express.Router();

// Public routes
router.get("/", getAllLaptops);
router.get("/:id", validateMongoId, getLaptopById);

// Admin only routes
router.post("/",
  authMiddleware,
  requireAdmin,
  validateLaptopCreate,
  createLaptop
);

router.put("/:id",
  authMiddleware,
  requireAdmin,
  validateMongoId,
  validateLaptopUpdate,
  updateLaptop
);

router.delete("/:id",
  authMiddleware,
  requireAdmin,
  validateMongoId,
  deleteLaptop
);

export default router;