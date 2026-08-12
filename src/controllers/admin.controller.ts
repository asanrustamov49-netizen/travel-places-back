import { NextFunction, Request, Response } from "express";
import { getDashboardStatisticsService } from "../services/admin.service";

export const getDashboardStatisticsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const statistics = await getDashboardStatisticsService();

    res.status(200).json({
      message: "Statistics received successfully",
      data: statistics,
    });
  } catch (error) {
    next(error);
  }
};
