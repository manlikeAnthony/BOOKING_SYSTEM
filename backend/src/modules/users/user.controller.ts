import { Request, Response } from "express";
import {
    getAllUsersService,
    getUserByIdService,
    deleteUserService,
    updateUserStatusService,
    updateUserRoleService
} from "./user.service";

import { parseUserQuery } from "./user.query";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import { CustomError } from "../../errors/CustomError";
import type { Params } from "../../types/auth.types";


export const getAllUsersController = async (req: Request, res: Response) => {
  const query = parseUserQuery(req);

  const users = await getAllUsersService(query);

  res.status(HttpCodes.OK).json({
    code: AppCodes.SUCCESS,
    message: "Users retrieved successfully",
    data: users,
  });
};

export const getUserByIdController = async (req: Request<Params>, res: Response) => {
  const userId = req.params.id;

  const user = await getUserByIdService(userId);

  res.status(HttpCodes.OK).json({
    code: AppCodes.SUCCESS,
    message: "User retrieved successfully",
    data: user,
  });
};

export const deleteUserController = async (req: Request<Params>, res: Response) => {
  const userId = req.params.id;
  const requestUser = req.user;

  await deleteUserService(requestUser, userId);

  res.status(HttpCodes.OK).json({
    code: AppCodes.SUCCESS,
    message: "User deleted successfully",
  });
};
