import { Router } from "express";
import {
  postRatingController,
  getPlaceRatingsController,
  updateRatingController,
  deleteRatingController,
} from "../controllers/rating.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.post("/:placeId", authMiddleware, postRatingController);
router.get("/:placeId", getPlaceRatingsController);
router.patch("/:placeId", authMiddleware, updateRatingController);
router.delete("/:placeId", authMiddleware, deleteRatingController);

export default router;
