import { Router } from "express";
import {
  postPlaceController,
  getOnePlaceController,
  updatePlaceController,
  deletePlaceController,
  getPlacesFilteredController,
} from "../controllers/places.controller";
import { uploadMiddleware } from "../middlewares/uploads";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.post(
  "/",
  authMiddleware,
  uploadMiddleware.array("images", 10),
  postPlaceController,
);
router.get("/", getPlacesFilteredController);
router.get("/:id", getOnePlaceController);
router.delete("/:id", authMiddleware, deletePlaceController);
router.patch(
  "/:id",
  authMiddleware,
  uploadMiddleware.array("images", 10),
  updatePlaceController,
);

export default router;
