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
  const allowedRoles: HotelRole[] = ["HOTEL_OWNER", "MANAGER"];

  if (!membership || !allowedRoles.includes(membership.role)) {
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
  const newMember = await prisma.hotelMember.create({
    data: {
      hotelId,
      userId: targetUserId,
      role,
    },
  });

  return newMember;
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
  const allowedRoles: HotelRole[] = ["HOTEL_OWNER", "MANAGER"];

  if (!membership || !allowedRoles.includes(membership.role)) {
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

  return targetMembership;
};

export const requestJoinHotelService = async (
  hotelId: string,
  userId: string,
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
  const existingRequest = await prisma.hotelJoinRequest.findFirst({
    where: {
      hotelId,
      userId,
    },
  });

  if (existingRequest) {
    CustomError.throwError(
      HttpCodes.CONFLICT,
      AppCodes.MEMBER_ALREADY_EXISTS,
      "You have already requested to join this hotel",
    );
  }
  const existingMembership = await prisma.hotelMember.findFirst({
    where: {
      hotelId,
      userId,
    },
  });

  if (existingMembership) {
    CustomError.throwError(
      HttpCodes.CONFLICT,
      AppCodes.MEMBER_ALREADY_EXISTS,
      "You are already a member of this hotel",
    );
  }

  if (role === "HOTEL_OWNER") {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Cannot request to join as HOTEL_OWNER",
    );
  }

  return await prisma.hotelJoinRequest.create({
    data: {
      hotelId,
      userId,
      roleRequested: role,
    },
  });
};

export const cancelJoinHotelRequestService = async (
  hotelId: string,
  userId: string,
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

  const existingRequest = await prisma.hotelJoinRequest.findFirst({
    where: {
      hotelId,
      userId,
    },
  });

  if(userId !== existingRequest?.userId) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not allowed to cancel this join request",
    );
  }

  if (!existingRequest) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.MEMBER_NOT_FOUND,
      "You do not have a pending join request for this hotel",
    );
  }



  await prisma.hotelJoinRequest.delete({
    where: {
      id: existingRequest.id,
    },
  });

  return existingRequest;
};


export const approveJoinHotelRequestService = async (
  hotelId: string,
  userId: string,
  requestId: string,
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
  const allowedRoles: HotelRole[] = ["HOTEL_OWNER", "MANAGER"];

  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not allowed to approve join requests for this hotel",
    );
  }

  const joinRequest = await prisma.hotelJoinRequest.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!joinRequest) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.MEMBER_NOT_FOUND,
      "Join request not found",
    );
  }

  const newMember = await prisma.hotelMember.create({
    data: {
      hotelId,
      userId: joinRequest.userId,
      role: joinRequest.roleRequested,
    },
  });

  await prisma.hotelJoinRequest.delete({
    where: {
      id: requestId,
    },
  });

  return newMember;
};


export const getAllHotelJoinRequestsService = async (
  hotelId: string,
  userId: string,
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
      "You are not allowed to view this hotel's join requests",
    );
  }

  const joinRequests = await prisma.hotelJoinRequest.findMany({
    where: {
      hotelId,
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

  return joinRequests.map((request) => ({
    id: request.id,
    roleRequested: request.roleRequested,
    user: request.user,
  }));
};


export const rejectJoinHotelRequestService = async (
  hotelId: string,
  userId: string,
  requestId: string,
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
  const allowedRoles: HotelRole[] = ["HOTEL_OWNER", "MANAGER"];

  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not allowed to reject join requests for this hotel",
    );
  }

  const joinRequest = await prisma.hotelJoinRequest.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!joinRequest) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.MEMBER_NOT_FOUND,
      "Join request not found",
    );
  }

  await prisma.hotelJoinRequest.delete({
    where: {
      id: requestId,
    },
  });

  return joinRequest;
};


export const updateHotelMemberRoleService = async (
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
  const allowedRoles: HotelRole[] = ["HOTEL_OWNER", "MANAGER"];

  if (!membership || !allowedRoles.includes(membership.role)) {
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

  const newRole = role.toUpperCase() as HotelRole;
  
  if(!newRole) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Role is required",
    );
  }

  if(newRole === targetMembership.role) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "New role must be different from the current role",
    );
  }

  if(newRole === "HOTEL_OWNER") {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Cannot assign HOTEL_OWNER role to another user",
    );
  }

  const updatedMember = await prisma.hotelMember.update({
    where: {
      id: targetMembership.id,
    },
    data: {
      role: newRole,
    },
  });

  return updatedMember;
};

export const getHotelMemberByIdService = async (
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

  const member = await prisma.hotelMember.findUnique({
    where: {
      id: memberId,
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

export const getSingleHotelMemberByUserIdService = async (
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
      userId: targetUserId,
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
