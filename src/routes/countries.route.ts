import { Router } from "express";
import {
  deleteCountryController,
  getCountriesController,
  getOneCountryController,
  postCountryController,
  updateCountryController,
} from "../controllers/countries.controller";

const router = Router();
router.post("/", postCountryController);
router.get("/", getCountriesController);
router.get("/:id", getOneCountryController);
router.delete("/:id", deleteCountryController);
router.patch("/:id", updateCountryController);

export default router;
