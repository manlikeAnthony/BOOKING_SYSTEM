import qs from "qs";
import { Request, Response } from "express";

export const parseNestedFormData = (
  req: Request,
  _res: Response,
  next: () => void,
) => {
  console.log("BEFORE PARSE");
  console.dir(req.body, { depth: null });

  req.body = qs.parse(req.body);

  console.log("AFTER PARSE");
  console.dir(req.body, { depth: null });

  next();
};
