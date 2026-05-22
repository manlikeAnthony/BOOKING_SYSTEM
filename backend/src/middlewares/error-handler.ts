// src/middlewares/error-handler.ts
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../errors/CustomError";
import { AppCodes } from "../errors/AppCodes";
import { HttpCodes } from "../errors/HttpCodes";
import { CustomLogger } from "../logger/CustomLogger";

export const errorHandlerMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {

  // Handle known CustomErrors first
  if (err instanceof CustomError) {
    return res.status(err.httpCode).json({
      code: err.appCode,
      message: err.message,
      details: err.details ?? null
    });
  }

  let httpCode = HttpCodes.INTERNAL_SERVER_ERROR;
  let appCode = AppCodes.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong, try again later";

  /**
   * Mongoose Validation Error
   */
  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    err.name === "ValidationError"
  ) {
    httpCode = HttpCodes.BAD_REQUEST;
    appCode = AppCodes.VALIDATION_FAILED;

    const validationErr = err as any;

    message = Object.values(validationErr.errors)
      .map((item: any) => item.message)
      .join(", ");
  }

  /**
   * Mongo Duplicate Key Error
   */
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as any).code === 11000
  ) {
    httpCode = HttpCodes.BAD_REQUEST;
    appCode = AppCodes.DATABASE_ERROR;

    const duplicateErr = err as any;

    message = `Duplicate value entered for ${Object.keys(
      duplicateErr.keyValue
    )} field`;
  }

  /**
   * Cast Error (invalid ObjectId)
   */
  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    err.name === "CastError"
  ) {
    httpCode = HttpCodes.NOT_FOUND;
    appCode = AppCodes.RESOURCE_NOT_FOUND;

    const castErr = err as any;

    message = `No item found with id: ${castErr.value}`;
  }

  // Log unknown error
  CustomLogger.error("GlobalErrorHandler", appCode, {
    message,
    stack: err instanceof Error ? err.stack : undefined
  });

  return res.status(httpCode).json({
    code: appCode,
    message
  });
};