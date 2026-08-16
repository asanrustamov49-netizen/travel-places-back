import { Request, Response, NextFunction } from "express";
import {
  createBooking,
  getMyBookings,
  getOneMyBooking,
} from "../services/booking.service";
import { bookingSchema } from "../validation/booking.validate";

export const postBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const placeId = Number(req.params.placeId);
    const validatedData = bookingSchema.parse(req.body);
    const result = await createBooking(userId!, placeId, validatedData, next);

    return res.status(201).json({
      message: "Booking created successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const getMyBookingsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const result = await getMyBookings(userId!);

    return res.status(200).json({
      message: "Bookings received successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const getOneMyBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const bookingId = Number(req.params.bookingId);
    const result = await getOneMyBooking(userId!, bookingId);

    return res.status(200).json({
      message: "Booking received successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};
