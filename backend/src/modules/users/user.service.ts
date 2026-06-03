import { prisma } from "../../config/database";
import { CustomError } from "../../errors/CustomError";
import { HttpCodes } from "../../errors/HttpCodes";
import { AppCodes } from "../../errors/AppCodes";
import { UserQuery} from "./user.query";
import { checkPermissions } from "../../utils";
import { TokenUser } from "../../types/token";

export const getAllUsersService = async (query: UserQuery) => {
  const { filters, pagination, sort } = query;

  const whereClause: any = {};

  if (filters.name) {
    whereClause.name = {
      contains: filters.name,
      mode: "insensitive",
    };
  }


  const users = await prisma.user.findMany({
    where: whereClause,
    skip: pagination.skip,
    take: pagination.limit,
    orderBy: {
      [sort.field]: sort.order,
    },
  });

  return users;
};

export const getUserByIdService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.USER_NOT_FOUND,
      "User not found",
    );
  }

  return user;
};

export const deleteUserService = async (requestUser: TokenUser, userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.USER_NOT_FOUND,
      "User not found",
    );
  }

checkPermissions(requestUser, user.id);

  await prisma.user.delete({
    where: { id: userId },
  });
};

export const updateUserStatusService = async (
  userId: string,
  status: "ACTIVE" | "INACTIVE",
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.USER_NOT_FOUND,
      "User not found",
    );
  }
  
  await prisma.user.update({ 
    where: { id: userId },
    data: { isActive: status === "ACTIVE" },
  });
};

export const updateUserRoleService = async (
  userId: string,
  role: "USER" | "SUPER_ADMIN",
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.USER_NOT_FOUND,
      "User not found",
    );
  }
  
  await prisma.user.update({ 
    where: { id: userId },
    data: { role },
  });
};

