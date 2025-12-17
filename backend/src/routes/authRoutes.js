import express from "express";
import {
  register,
  login,
  loginGoogle,
  getProfile
} from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middlewares/validateAuth.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/google", loginGoogle);
router.get("/me", authMiddleware, getProfile);

export default router;
