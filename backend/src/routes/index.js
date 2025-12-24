import express from "express";
import authRoutes from "./authRoutes.js";
import laptopRoutes from "./laptopRoutes.js";
import orderRoutes from "./orderRoutes.js";
import userRoutes from "./userRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import discountRoutes from "./discountRoutes.js";
import cartRoutes from "./cartRoutes.js";
import paymentRoutes from "./paymentRoutes.js";

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
        profile: "GET /auth/me (requires token)",
        updateProfile: "PUT /auth/me/update (requires token)"
      },
      user: {
        getAll: "GET /users (admin only)",
        search: "GET /users/search?email=... (admin only)",
        update: "PUT /users/:id (admin only)",
        delete: "DELETE /users/:id (admin only)"
      },
      laptops: {
        getAll: "GET /laptops",
        getById: "GET /laptops/:id",
        getFeatured: "GET /laptops/featured",
        create: "POST /laptops (admin only)",
        update: "PUT /laptops/:id (admin only)",
        delete: "DELETE /laptops/:id (admin only)",
        updateStock: "PUT /laptops/:id/stock (admin only)"
      },
      orders: {
        create: "POST /orders (requires token)",
        getMyOrders: "GET /orders/my (requires token)",
        getById: "GET /orders/:id (requires token)",
        cancel: "DELETE /orders/:id (requires token)",
        updateStatus: "PATCH /orders/:id/status (admin only)",
        getAll: "GET /orders (admin only)"
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
router.use("/users", userRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/discounts", discountRoutes);
router.use("/carts", cartRoutes);
router.use("/payments", paymentRoutes);

export default router;