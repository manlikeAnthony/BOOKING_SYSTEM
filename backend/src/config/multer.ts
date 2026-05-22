import multer from "multer";
import { AppCodes } from "../errors/AppCodes";
import { CustomError } from "../errors/CustomError";
import { HttpCodes } from "../errors/HttpCodes";


const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        CustomError.throwError(
          HttpCodes.BAD_REQUEST,
          AppCodes.INVALID_INPUT,
          "Invalid file type. Only JPEG, PNG, and GIF are allowed."
        )
      );
    }
    cb(null, true);
  },
});
