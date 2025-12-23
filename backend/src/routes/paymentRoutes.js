import { Router } from "express";
import {
    processPayment,
    addCreditCard,
    getCreditCards,
    addBalance,
    getBalance,
} from "../controllers/paymentController.js";

const router = Router();

router.post("/payments", processPayment);
router.post("/credit-cards", addCreditCard);
router.get("/credit-cards", getCreditCards);
router.post("/credit-cards/:cardNumber/balance", addBalance);
router.get("/credit-cards/:cardNumber/balance", getBalance);

export default router;