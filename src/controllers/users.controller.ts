import { NextFunction, Request, Response } from "express";
import {
  deleteUserService,
  getOneUserService,
  getUsersService,
  updateUserService,
} from "../services/users.service";
import {
  UpdateUserSchema,
} from "../validation/users.validate";

export const getUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const result = await getUsersService(page, limit, search);

    res.status(200).json({
      message: "Users received successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const getOneUserController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    const result = await getOneUserService(id);

    res.status(200).json({
      message: "User received successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const deleteUserController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    const result = await deleteUserService(id);

    res.status(200).json({
      message: "User deleted successfully",
      deleted: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const updateUserController = async (
  req: Request<
    { id: string },
    {},
    {
      name?: string;
      email?: string;
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    const validation = UpdateUserSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const result = await updateUserService(id, validation.data);

    res.status(200).json({
      message: "User updated successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};
