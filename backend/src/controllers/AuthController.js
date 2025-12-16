import UserService from "../services/userService.js";
import logger from "../utils/logger.js";
import { signToken } from "../utils/jwt.js";

class AuthController {

  // POST /api/auth/register
  static async register(req, res) {
    try {
      const { email, password, name } = req.body;

      const user = await UserService.registerUser({
        email,
        password,
        name
      });

      const token = signToken(user);
      logger.info("New user registered: " + user.email);
      return res.status(201).json({
        message: "User registered successfully",
        user,
        token
      });
    } catch (error) {
        logger.warn("Registration error: " + error.message);
        return res.status(400).json({
            message: error.message
        });
    }
  }

  // POST /api/auth/login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await UserService.loginLocal({
        email,
        password
      });

      const token = signToken(user);
      logger.info("User logged in: " + user.email);

      return res.status(200).json({
        message: "Login success",
        user,
        token
      });
    } catch (error) {
        logger.warn("Login error: " + error.message);
        return res.status(401).json({
            message: error.message
        });
    }
  }

  // POST /api/auth/google
  static async loginGoogle(req, res) {
    try {
        const { email, name, googleId } = req.body;

        const user = await UserService.loginGoogle({
            email,
            name,
            googleId,   
        });

        const token = signToken(user);
        logger.info("User logged in with Google: " + user.email);
        return res.status(200).json({
            message: "Google login success",
            user,
            token
        });
    } catch (error) {
        logger.warn("Google login error: " + error.message);
        return res.status(400).json({
            message: error.message
        });
    }
  }

  // GET /api/auth/me
  static async getProfile(req, res) {
    try {
        const userId = req.user.userId;

        const user = await UserService.getUserById(userId);
        logger.info("Fetched profile for userId: " + userId);
        return res.status(200).json({
            user
        });
    } catch (error) {
        logger.warn("Get profile error: " + error.message);
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
  }
}

export default AuthController;
