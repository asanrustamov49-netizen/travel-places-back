import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { apiErrors } from "../utils/apiErrors";

interface JwtPayload {
  id: number;
  email: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(apiErrors.unauthorized("Authorization token is required"));
    }
    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) {
      return next(apiErrors.unauthorized("Invalid authorization format"));
    }
    const decoded = jwt.verify(token, "travel-places") as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    next(apiErrors.unauthorized("Invalid or expired token"));
  }
};
