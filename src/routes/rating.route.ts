import { Router } from "express";
import {
  postRatingController,
  getPlaceRatingsController,
  updateRatingController,
  deleteRatingController,
} from "../controllers/rating.controller";

const router = Router();
router.post("/:placeId", postRatingController);
router.get("/:placeId", getPlaceRatingsController);
router.patch("/:placeId", updateRatingController);
router.delete("/:placeId", deleteRatingController);

export default router;
