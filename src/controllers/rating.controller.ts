import { NextFunction, Request, Response } from "express";
import {
  postRatingService,
  getPlaceRatingsService,
  updateRatingService,
  deleteRatingService,
} from "../services/rating.service";
import { apiErrors } from "../utils/apiErrors";

export const postRatingController = async (
  req: Request<
    { placeId: string },
    {},
    {
      rating: number;
    }
  >,
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

    res.status(201).json({
      message: "Rating added successfully",
      data: result,
    });
  } catch (error) {
    next(error);
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
  } catch (error) {
    next(error);
  }
};

export const updateRatingController = async (
  req: Request<
    { placeId: string },
    {},
    {
      rating: number;
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(apiErrors.unauthorized("Unauthorized"));
    }

    const userId = req.user.id;
    const placeId = Number(req.params.placeId);

    const result = await updateRatingService(userId, placeId, req.body.rating);

    res.status(200).json({
      message: "Rating updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRatingController = async (
  req: Request<{ placeId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(apiErrors.unauthorized("Unauthorized"));
    }

    const userId = req.user.id;
    const placeId = Number(req.params.placeId);

    const result = await deleteRatingService(userId, placeId);

    res.status(200).json({
      message: "Rating deleted successfully",
      deleted: result,
    });
  } catch (error) {
    next(error);
  }
};
