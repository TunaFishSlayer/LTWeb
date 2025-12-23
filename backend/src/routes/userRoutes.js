// routes/userRoutes.js
import express from "express";
import {
  getProfile,
  updateUserProfile,
  getAllUsers,
  searchUserByEmail,
  updateUserByAdmin,
  deleteUser
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/roleMiddleware.js";
import { validateMongoId } from "../middlewares/validateLaptop.js";

const router = express.Router();

router.get("/me", authMiddleware, getProfile);
router.put("/me/update", authMiddleware, updateUserProfile);

// Admin routes
router.get("/", authMiddleware, requireAdmin, getAllUsers);
router.get("/search", authMiddleware, requireAdmin, searchUserByEmail);
router.put("/:id", authMiddleware, requireAdmin, validateMongoId, updateUserByAdmin);
router.delete("/:id", authMiddleware, requireAdmin, validateMongoId, deleteUser);

export default router;