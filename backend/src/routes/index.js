import express from "express";
import authRoutes from "./authRoutes.js";
import laptopRoutes from "./laptopRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/laptops", laptopRoutes);

export default router;