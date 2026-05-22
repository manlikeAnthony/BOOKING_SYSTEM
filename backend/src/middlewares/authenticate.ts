import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { TokenUser } from "../types/token";
import { CustomError } from "../errors/CustomError";
import { AppCodes } from "../errors/AppCodes";
import { HttpCodes } from "../errors/HttpCodes";

export const authenticateUser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    CustomError.throwError(
      HttpCodes.UNAUTHORIZED,
      AppCodes.AUTH_UNAUTHORIZED,
      "Authentication invalid",
      { route: req.originalUrl },
    );
  }

  try {
    const payload = verifyToken<{ user: TokenUser }>(token);

    req.user = payload.user;
    next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Token verification failed";

    CustomError.throwError(
      HttpCodes.UNAUTHORIZED,
      AppCodes.AUTH_UNAUTHORIZED,
      "Authentication code invalid",
      {
        route: req.originalUrl,
        tokenError: message,
      },
    );
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      CustomError.throwError(
        HttpCodes.UNAUTHORIZED,
        AppCodes.AUTH_UNAUTHORIZED,
        "Authentication required",
      );
    }
    const userRole = req.user.role;


    if(!allowedRoles.includes(userRole)) {
      CustomError.throwError(
        HttpCodes.FORBIDDEN,
        AppCodes.AUTH_UNAUTHORIZED,
        "You do not have permission to access this resource",
      );
    }
    next();
  };
};
