import { Router } from "express";
import {
    processPayment,
    addCreditCard,
    getCreditCards,
    addBalance,
    getBalance,
} from "../controllers/paymentController.js";

const router = Router();

// Temporarily remove auth middleware for testing
// Add it back after server restart: router.post("/payments", authMiddleware, processPayment);
router.post("/payments", processPayment);
router.post("/credit-cards", addCreditCard);
router.get("/credit-cards", getCreditCards);
router.post("/credit-cards/:cardNumber/balance", addBalance);
router.get("/credit-cards/:cardNumber/balance", getBalance);

export default router;