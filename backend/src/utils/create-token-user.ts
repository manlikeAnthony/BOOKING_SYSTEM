import { User } from "@prisma/client";
import { TokenUser } from "../types/token";

export const createTokenUser = (user: User): TokenUser => {
  return {
    userId: user.id,
    name: user.name,
    role: user.role,
  };
};