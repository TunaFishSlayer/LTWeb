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
  validateLaptopId 
} from "../middlewares/validateLaptop.js";

const router = express.Router();

// Public routes
router.get("/", getAllLaptops);
router.get("/:id", validateLaptopId, getLaptopById);

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
  validateLaptopId,
  validateLaptopUpdate,
  updateLaptop
);

router.delete("/:id",
  authMiddleware,
  requireAdmin,
  validateLaptopId,
  deleteLaptop
);

export default router;