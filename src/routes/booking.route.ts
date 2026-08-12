import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  postBookingController,
  getMyBookingsController,
  getOneMyBookingController,
} from "../controllers/booking.controller";

const router = Router();
router.post("/:placeId", authMiddleware, postBookingController);
router.get("/my", authMiddleware, getMyBookingsController);
router.get("/my/:bookingId", authMiddleware, getOneMyBookingController);

export default router;
