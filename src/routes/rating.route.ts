import { Router } from "express";
import {
  postRatingController,
  getPlaceRatingsController,
} from "../controllers/rating.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.post("/:placeId", authMiddleware, postRatingController);
router.get("/:placeId", getPlaceRatingsController);

export default router;
