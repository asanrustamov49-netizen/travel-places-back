import { NextFunction, Request, Response } from "express";
import { getDashboardStatisticsService } from "../services/admin.service";

export const getDashboardStatisticsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getDashboardStatisticsService();

    res.status(200).json({
      message: "Statistics received successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};
