import { NextFunction, Request, Response } from "express";
import {
  deletePlaceService,
  getOnePlaceService,
  getPlacesFilteredService,
  getPlacesService,
  IGetPlacesParams,
  postPlaceService,
  updatePlaceService,
} from "../services/places.service";
import {
  createPlaceSchema,
  placeSchema,
  updatePlaceSchema,
} from "../validation/places.validate";
import { apiErrors } from "../utils/apiErrors";

export interface ICreatePlace {
  user_id: number;
  country_id: number;
  title: string;
  description: string;
  city: string;
  type: "Beach" | "Culture" | "Adventure" | "Nature" | "City";
  price: number;
  images: string[];
}

export const postPlaceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("🔥 CONTROLLER REACHED");
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const validation = createPlaceSchema.safeParse(req.body);

    if (!validation.success) {
      console.log("❌ VALIDATION ERROR:");
      console.log(validation.error.issues);

      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    if (!req.user) {
      return next(apiErrors.unauthorized("Unauthorized"));
    }

    const userId = req.user.id;
    const files = req.files as Express.Multer.File[];
    const images = files.map((file) => `/uploads/${file.filename}`);
    const result = await postPlaceService({
      ...validation.data,
      user_id: userId!,
      images,
    });

    res.status(201).json({
      message: "Places received successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
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
  } catch (error) {
    next(error);
  }
};

export const getOnePlaceController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    const result = await getOnePlaceService(id);

    res.status(200).json({
      message: "Place received successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlaceController = async (
  req: Request<{ id: string }>,
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
  } catch (error) {
    next(error);
  }
};

export const updatePlaceController = async (
  req: Request<
    { id: string },
    {},
    {
      country_id?: number;
      title?: string;
      description?: string;
      city?: string;
      type?: "Beach" | "Culture" | "Adventure" | "Nature" | "City";
      price?: number;
      best_season?: string;
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    const validation = updatePlaceSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const result = await updatePlaceService(id, validation.data);

    res.status(200).json({
      message: "Place updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlacesFilteredController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      type,
      country_id,
      price_min,
      price_max,
      search,
      sort,
      page,
      limit,
    } = req.query;

    const params: IGetPlacesParams = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 6,
    };

    if (type) params.type = String(type);
    if (country_id) params.country_id = Number(country_id);
    if (price_min) params.price_min = Number(price_min);
    if (price_max) params.price_max = Number(price_max);
    if (search) params.search = String(search);
    if (sort) params.sort = String(sort);

    const result = await getPlacesFilteredService(params);

    res.status(200).json({
      message: "Places received successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// export const uploadPlaceImagesController = async (
//   req: Request<{ id: string }>,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const placeId = Number(req.params.id);

//     if (Number.isNaN(placeId)) {
//       return res.status(400).json({
//         message: "Invalid place ID",
//       });
//     }

//     const files = req.files as Express.Multer.File[];

//     if (!files || files.length === 0) {
//       return res.status(400).json({
//         message: "Images are required",
//       });
//     }

//     const imagePaths = files.map((file) => `/uploads/${file.filename}`);

//     // потом передаем imagePaths в service
//     // const result = await uploadPlaceImagesService(
//     //   placeId,
//     //   imagePaths,
//     // );

//     res.status(201).json({
//       message: "Images uploaded successfully",
//       images: imagePaths,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
