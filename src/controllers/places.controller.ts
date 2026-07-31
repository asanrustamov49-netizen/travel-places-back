import { NextFunction, Request, Response } from "express";
import {
  deletePlaceService,
  getOnePlaceService,
  getPlacesService,
  postPlaceService,
  updatePlaceService,
} from "../services/places.service";
import { placeSchema } from "../validation/places.validate";

export const postPlaceController = async (
  req: Request<
    {},
    {},
    {
      user_id: number;
      country_id: number;
      title: string;
      description: string;
      city: string;
      type: "Beach" | "Culture" | "Adventure" | "Nature" | "City";
      price: number;
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body;
    const validation = placeSchema.safeParse(body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const result = await postPlaceService(validation.data);

    res.status(201).json({
      message: "Place posted successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const getPlacesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getPlacesService();

    res.status(200).json({
      message: "Places received successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const getOnePlaceController = async (
  req: Request<{
    id: string;
  }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const result = await getOnePlaceService(id);

    res.status(200).json({
      message: "Place by id successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const deletePlaceController = async (
  req: Request<{
    id: string;
  }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const result = await deletePlaceService(id);

    res.status(200).json({
      message: "Place deleted successfully",
      deleted: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const updatePlaceController = async (
  req: Request<
    { id: string },
    {},
    {
      user_id: number;
      country_id: number;
      title: string;
      description: string;
      city: string;
      type: "Beach" | "Culture" | "Adventure" | "Nature" | "City";
      price: number;
      rating?: number;
      best_season?: string;
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body;
    const id = Number(req.params.id);
    const validation = placeSchema.safeParse(body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const result = await updatePlaceService(id, validation.data);

    res.status(200).json({
      message: "Place updated successfully",
      updatedData: result,
      updated_at: new Date(),
    });
  } catch (error: any) {
    next(error.message);
  }
};
