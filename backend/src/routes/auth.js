import express from "express";
import AuthController from "../controllers/AuthController.js";
import { validateRegister, validateLogin } from "../middlewares/validateAuth.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Register route
router.post("/register", validateRegister, AuthController.register);
router.post("/login", validateLogin, AuthController.login);
router.post("/google", AuthController.loginGoogle);
router.get("/me", authMiddleware, AuthController.getProfile);

export default router;
