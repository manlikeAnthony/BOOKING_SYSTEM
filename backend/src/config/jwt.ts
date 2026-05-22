import { Secret } from "jsonwebtoken";
import { CustomError } from "../errors/CustomError";
import { HttpCodes } from "../errors/HttpCodes";
import { AppCodes } from "../errors/AppCodes";

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET as Secret,
  accessTokenExpiry: "1d" as const,
  refreshTokenExpiry: "30d" as const,
};

if (!JWT_CONFIG.secret) {
  throw CustomError.throwError(
    HttpCodes.INTERNAL_SERVER_ERROR,
    AppCodes.RESOURCE_NOT_FOUND,
    "JWT_SECRET is not defined",
  );
}
