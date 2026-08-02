import { NextFunction, Request, Response } from "express";
import { countrySchema } from "../validation/country.validate";
import {
  deleteCountryService,
  getCountriesService,
  getOneCountryService,
  postCountryService,
  updateCountryService,
} from "../services/countries.service";

export const postCountryController = async (
  req: Request<
    {},
    {},
    {
      name: string;
      continent: string;
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body;
    const validation = countrySchema.safeParse(body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const result = await postCountryService(validation.data);

    res.status(201).json({
      message: "Country posted successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const getCountriesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getCountriesService();

    res.status(200).json({
      message: "Countries received successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const getOneCountryController = async (
  req: Request<{
    id: string;
  }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const result = await getOneCountryService(id);

    res.status(200).json({
      message: "Country by id successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const deleteCountryController = async (
  req: Request<{
    id: string;
  }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteCountryService(id);

    res.status(200).json({
      message: "Country deleted successfully",
      deleted: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const updateCountryController = async (
  req: Request<
    { id: string },
    {},
    {
      name: string;
      continent: string;
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body;
    const id = Number(req.params.id);
    const validation = countrySchema.safeParse(body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const result = await updateCountryService(id, validation.data);

    res.status(200).json({
      message: "Country updated successfully",
      updatedData: result,
      updated_at: new Date(),
    });
  } catch (error: any) {
    next(error.message);
  }
};
