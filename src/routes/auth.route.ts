import { Router } from "express";
import {
  registerController,
  loginController,
  profileController,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.post("/register", registerController);
router.post("/login", loginController);
router.get("/profile", authMiddleware, profileController);

export default router;
