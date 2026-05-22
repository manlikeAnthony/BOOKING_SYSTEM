import { logger } from "./logger";
import { AppCodes } from "../errors/AppCodes";

export class CustomLogger {
  static info(
    caller: string,
    code: AppCodes,
    details?: Record<string, unknown>,
  ) {
    logger.info({
      caller,
      code,
      ...details,
    });
  }

  static error(
    caller: string,
    code: AppCodes,
    details?: Record<string, unknown>,
  ) {
    logger.error({
      caller,
      code,
      ...details,
    });
  }
}
