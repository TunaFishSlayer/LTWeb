import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// All routes require admin authentication
router.get("/", authMiddleware, requireAdmin, getAnalytics);

export default router;

