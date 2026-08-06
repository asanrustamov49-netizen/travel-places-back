import { NextFunction, Request, Response } from "express";
import { countrySchema } from "../validation/country.validate";
import {
  getCountriesService,
  getOneCountryService,
} from "../services/countries.service";

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
