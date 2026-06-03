import type { TokenUser } from "../types/token";
import { CustomError } from "../errors/CustomError";
import { AppCodes } from "../errors/AppCodes";
import { HttpCodes } from "../errors/HttpCodes";

export const checkPermissions = (
  requestUser: TokenUser,
  resourseUserId: string,
): void => {
  if (!requestUser || !requestUser.userId) {
    CustomError.throwError(
      HttpCodes.UNAUTHORIZED,
      AppCodes.AUTH_UNAUTHORIZED,
      "Invalid authentication context",
    );
  }
  if (requestUser.role.includes("ADMIN")) return;
  if (requestUser.userId === resourseUserId) return;

  CustomError.throwError(
    HttpCodes.UNAUTHORIZED,
    AppCodes.AUTH_UNAUTHORIZED,
    "not authorized to access this route",
  );
};
