import { Role } from "@prisma/client";

export interface TokenUser {
  userId: string;
  name: string;
  role: Role;
}

export interface AccessTokenPayload {
  user: TokenUser;
}

export interface RefreshTokenPayload {
  user: TokenUser;
  refreshToken: string;
}
