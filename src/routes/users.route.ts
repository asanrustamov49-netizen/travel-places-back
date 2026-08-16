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
router.patch("/:id", updateUserController);
router.delete("/:id", deleteUserController);

export default router;
