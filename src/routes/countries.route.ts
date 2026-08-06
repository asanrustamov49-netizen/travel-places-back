import { Router } from "express";
import {
  getCountriesController,
  getOneCountryController,
} from "../controllers/countries.controller";

const router = Router();
router.get("/", getCountriesController);
router.get("/:id", getOneCountryController);

export default router;
