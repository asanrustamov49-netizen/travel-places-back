import { Router } from "express";

const router = Router();
router.post("/");
router.get("/");
router.get("/:id");
router.delete("/:id");
router.patch("/:id");

export default router;
