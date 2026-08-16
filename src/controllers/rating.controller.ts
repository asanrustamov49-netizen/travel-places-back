import { NextFunction, Request, Response } from "express";
import {
  postRatingService,
  getPlaceRatingsService,
} from "../services/rating.service";
import { apiErrors } from "../utils/apiErrors";

export const postRatingController = async (
  req: Request<{ placeId: string }, {}, { rating: number }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(apiErrors.unauthorized("Unauthorized"));
    }

    const userId = req.user.id;
    const placeId = Number(req.params.placeId);
    const result = await postRatingService(userId, placeId, req.body.rating);

    return res.status(201).json({
      message: "Rating added successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const getPlaceRatingsController = async (
  req: Request<{ placeId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const placeId = Number(req.params.placeId);
    const result = await getPlaceRatingsService(placeId);

    res.status(200).json({
      message: "Place ratings received successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};
