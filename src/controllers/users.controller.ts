import { NextFunction, Request, Response } from "express";
import { userSchema } from "../validation/users.validate";
import {
  deleteUserService,
  getOneUserService,
  getUsersService,
  updateUserService,
} from "../services/users.service";

export const getUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getUsersService();

    res.status(200).json({
      message: "Users received successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const getOneUserController = async (
  req: Request<{
    id: string;
  }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const result = await getOneUserService(id);

    res.status(200).json({
      message: "User by id received successfully",
      data: result,
    });
  } catch (error: any) {
    next(error.message);
  }
};

export const deleteUserController = async (
  req: Request<{
    id: string;
  }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteUserService(id);

    res.status(200).json({
      message: "Users deleted successfully",
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
      name: string;
      email: string;
      password: string;
      avatar: string;
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body;
    const id = Number(req.params.id);
    const validation = userSchema.safeParse(body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const result = await updateUserService(id, validation.data);

    res.status(200).json({
      message: "User updated successfully",
      updatedData: result,
      updated_at: new Date(),
    });
  } catch (error: any) {
    next(error.message);
  }
};
