import { CustomLogger } from "../logger/CustomLogger";
import { AppCodes } from "./AppCodes";
import { HttpCodes } from "./HttpCodes";

export class CustomError extends Error {
  private constructor(
    public httpCode: HttpCodes,
    public appCode: AppCodes,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message); // MUST be first

    this.name = this.constructor.name;
    this.httpCode = httpCode;
    this.appCode = appCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static throwError(
    httpCode: HttpCodes,
    appCode: AppCodes,
    message: string,
    details?: Record<string, unknown>,
  ): never {
    const error = new CustomError(httpCode, appCode, message, details);

    CustomLogger.error(`${error.name}.throwError`, error.appCode, {
      message: error.message,
      httpCode: error.httpCode,
      ...error.details,
      stack: error.stack,
    });

    throw error;
  }
}
