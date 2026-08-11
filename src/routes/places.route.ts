import { Router } from "express";
import {
  postPlaceController,
  getOnePlaceController,
  updatePlaceController,
  deletePlaceController,
  getPlacesController,
  getPlacesFilteredController,
} from "../controllers/places.controller";
import { uploadMiddleware } from "../middlewares/uploads";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.post(
  "/",
  (req, res, next) => {
    console.log("🔥 ROUTE REACHED");
    next();
  },
  authMiddleware,
  (req, res, next) => {
    console.log("🔥 AUTH PASSED");
    next();
  },
  uploadMiddleware.array("images", 10),
  (req, res, next) => {
    console.log("🔥 MULTER PASSED");
    next();
  },
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
