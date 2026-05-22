import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenUser,
} from "../types/token";

export const createAccessToken = (user: TokenUser): string => {
  const payload: AccessTokenPayload = { user };
  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.accessTokenExpiry,
  });
};

export const createRefreshToken = (
  user: TokenUser,
  refreshToken: string
): string => {
  const payload: RefreshTokenPayload = { user, refreshToken };
  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.refreshTokenExpiry,
  });
};

export const verifyToken = <T>(token: string): T => {
  return jwt.verify(token, JWT_CONFIG.secret) as T;
};
