import { Router } from "express";
import {
  deletePlaceController,
  getOnePlaceController,
  getPlacesController,
  postPlaceController,
  updatePlaceController,
} from "../controllers/places.controller";

const router = Router();
router.post("/", postPlaceController);
router.get("/", getPlacesController);
router.get("/:id", getOnePlaceController);
router.delete("/:id", deletePlaceController);
router.patch("/:id", updatePlaceController);

export default router;
