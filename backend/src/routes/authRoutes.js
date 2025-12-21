import express from "express";
import {
  register,
  login,
  loginGoogle,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { testEmail } from "../controllers/testController.js";
import { validateRegister, validateLogin } from "../middlewares/validateAuth.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/google", loginGoogle);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/test-email", testEmail);

export default router;
