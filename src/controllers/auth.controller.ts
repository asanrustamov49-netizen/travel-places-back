import { NextFunction, Request, Response } from "express";
import {
  registerService,
  loginService,
  profileService,
} from "../services/auth.service";
import { loginSchema, registerSchema } from "../validation/auth.validate";
import { apiErrors } from "../utils/apiErrors";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body;

    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const result = await registerService(validation.data);

    res.status(201).json({
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body;

    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const result = await loginService(validation.data);

    res.status(200).json({
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const profileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(apiErrors.unauthorized("Unauthorized"));
    }

    const userId = req.user.id;

    const result = await profileService(userId);

    res.status(200).json({
      message: "Profile received successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
