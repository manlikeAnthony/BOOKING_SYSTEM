import { Response } from "express";
import {
  createAccessToken,
  createRefreshToken,
} from "./jwt";
import { TokenUser } from "../types/token";

interface AttachCookiesArgs {
  res: Response;
  user: TokenUser;
  refreshToken: string;
}

export const attachCookiesToResponse = ({
  res,
  user,
  refreshToken,
}: AttachCookiesArgs) => {
  const accessTokenJWT = createAccessToken(user);
  const refreshTokenJWT = createRefreshToken(user, refreshToken);

  const oneDay = 1000 * 60 * 60 * 24;
  const thirtyDays = 1000 * 60 * 60 * 24 * 30;

  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + oneDay),
  });

  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + thirtyDays),
  });
};
