import { Router } from "express";
import {
  deleteUserController,
  getOneUserController,
  getUsersController,
  updateUserController,
} from "../controllers/users.controller";

const router = Router();
router.get("/", getUsersController);
router.get("/:id", getOneUserController);
router.delete("/:id", deleteUserController);
router.patch("/:id", updateUserController);

export default router;
