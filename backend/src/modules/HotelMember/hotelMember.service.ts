import { prisma } from "../../config/database";
import { CustomError } from "../../errors/CustomError";
import { HttpCodes } from "../../errors/HttpCodes";
import { AppCodes } from "../../errors/AppCodes";
import { getMembership } from "../../utils/getMembership";
import { HotelRole } from "@prisma/client";
import { HotelMemberQuery } from "./hotelMember.query";

export const getAllHotelMembersService = async (
  hotelId: string,
  userId: string,
  query: HotelMemberQuery,
) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
  });

  if (!hotel) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.HOTEL_NOT_FOUND,
      "Hotel not found",
    );
  }
  const membership = await getMembership(hotelId, userId);

  if (!membership) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not allowed to view this hotel's members",
    );
  }
  const { filters, pagination, sort } = query;

  const whereClause: any = {
    hotelId,
  };

  if (filters.role) {
    whereClause.role = filters.role;
  }

  const members = await prisma.hotelMember.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    skip: pagination.skip,
    take: pagination.limit,
    orderBy: {
      [sort.field]: sort.order,
    },
  });

  return members.map((member) => ({
    id: member.id,
    role: member.role,
    user: member.user,
  }));
};

export const addHotelMemberService = async (
  hotelId: string,
  userId: string,
  targetUserId: string,
  role: HotelRole,
) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
  });

  if (!hotel) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.HOTEL_NOT_FOUND,
      "Hotel not found",
    );
  }

  const membership = await getMembership(hotelId, userId);

  if (!membership || membership.role !== "HOTEL_OWNER") {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not allowed to add members to this hotel",
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.USER_NOT_FOUND,
      "Target user not found",
    );
  }

  const existingMember = await prisma.hotelMember.findFirst({
    where: {
      hotelId,
      userId: targetUserId,
    },
  });

  if (existingMember) {
    CustomError.throwError(
      HttpCodes.CONFLICT,
      AppCodes.MEMBER_ALREADY_EXISTS,
      "User is already a member of this hotel",
    );
  }
  if (role === "HOTEL_OWNER") {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Cannot assign HOTEL_OWNER role to another user",
    );
  }
  await prisma.hotelMember.create({
    data: {
      hotelId,
      userId: targetUserId,
      role,
    },
  });

  return;
};

export const removeHotelMemberService = async (
  hotelId: string,
  userId: string,
  targetUserId: string,
) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
  });

  if (!hotel) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.HOTEL_NOT_FOUND,
      "Hotel not found",
    );
  }

  const membership = await getMembership(hotelId, userId);

  if (!membership || membership.role !== "HOTEL_OWNER") {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not allowed to remove members from this hotel",
    );
  }

  const targetMembership = await prisma.hotelMember.findFirst({
    where: {
      hotelId,
      userId: targetUserId,
    },
  });

  if (!targetMembership) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.MEMBER_NOT_FOUND,
      "Target user is not a member of this hotel",
    );
  }

  if (targetMembership.role === "HOTEL_OWNER") {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Cannot remove HOTEL_OWNER from the hotel",
    );
  }

  await prisma.hotelMember.delete({
    where: {
      id: targetMembership.id,
      hotelId,
      userId: targetUserId,
    },
  });

  return;
};

export const updateHotelMemberRoleService = async (
  hotelId: string,
  userId: string,
  targetUserId: string,
  newRole: HotelRole,
) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
  });

  if (!hotel) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.HOTEL_NOT_FOUND,
      "Hotel not found",
    );
  }

  const membership = await getMembership(hotelId, userId);

  if (!membership || !  !["HOTEL_OWNER", "MANAGER"].includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not allowed to update members of this hotel",
    );
  }

  const targetMembership = await prisma.hotelMember.findFirst({
    where: {
      hotelId,
      userId: targetUserId,
    },
  });

  if (!targetMembership) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.MEMBER_NOT_FOUND,
      "Target user is not a member of this hotel",
    );
  }

  if (targetMembership.role === "HOTEL_OWNER") {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Cannot change role of HOTEL_OWNER",
    );
  }

  await prisma.hotelMember.update({
    where: {
      id: targetMembership.id,
    },
    data: {
      role: newRole,
    },
  });

  return;
};

export const getSingleHotelMemberService = async (
  hotelId: string,
  userId: string,
  memberId: string,
) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
  });

    if (!hotel) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.HOTEL_NOT_FOUND,
      "Hotel not found",
    );
  }

  const membership = await getMembership(hotelId, userId);

  if (!membership) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not allowed to view this hotel's members",
    );
  }

  const member = await prisma.hotelMember.findFirst({
    where: {
      hotelId,
      userId: memberId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!member) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.MEMBER_NOT_FOUND,
      "Member not found in this hotel",
    );
  }

  return {
    id: member.id,
    role: member.role,
    user: member.user,
  };
};