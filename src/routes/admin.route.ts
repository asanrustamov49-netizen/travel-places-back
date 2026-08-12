import { Router } from "express";
import { getDashboardStatisticsController } from "../controllers/admin.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.get("/statistics", authMiddleware, getDashboardStatisticsController);

export default router;
