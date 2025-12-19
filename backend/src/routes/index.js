import express from "express";
import authRoutes from "./authRoutes.js";
import laptopRoutes from "./laptopRoutes.js";
import orderRoutes from "./orderRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import discountRoutes from "./discountRoutes.js";

const router = express.Router();

// Root API route - provides API information
router.get("/", (req, res) => {
  res.json({
    message: "Laptop Store API",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: "POST /auth/register",
        login: "POST /auth/login", 
        google: "POST /auth/google",
        profile: "GET /auth/me (requires token)"
      },
      laptops: {
        getAll: "GET /laptops",
        getById: "GET /laptops/:id",
        create: "POST /laptops (admin only)",
        update: "PUT /laptops/:id (admin only)",
        delete: "DELETE /laptops/:id (admin only)"
      },
      orders: {
        create: "POST /orders (requires token)",
        getMyOrders: "GET /orders/my (requires token)",
        getById: "GET /orders/:id (requires token)"
      },
      analytics: {
        getAnalytics: "GET /analytics?timeRange=week|month|quarter (admin only)"
      },
      discounts: {
        getAll: "GET /discounts (admin only)",
        getById: "GET /discounts/:id (admin only)",
        create: "POST /discounts (admin only)",
        update: "PUT /discounts/:id (admin only)",
        delete: "DELETE /discounts/:id (admin only)"
      }
    },
    docs: "/api-docs"
  });
});

router.use("/auth", authRoutes);
router.use("/laptops", laptopRoutes);
router.use("/orders", orderRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/discounts", discountRoutes);

export default router;