import { TokenUser } from "../token";

declare global {
  namespace Express {
    interface Request {
      user?: TokenUser;

      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}

export {};