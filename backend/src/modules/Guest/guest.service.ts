import { prisma } from "../../config/database";
import { CustomError } from "../../errors/CustomError";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import { CreateGuestDto } from "../../dto/guest/createGuest.dto";
import { getMembership } from "../../utils/getMembership";
import { GuestQuery } from "./guest.query";

export const createGuestService = async (
  hotelId: string,
  userId: string,
  data: CreateGuestDto,
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
  const allowedRoles = ["HOTEL_OWNER", "MANAGER", "RECEPTIONIST"];

  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not authorized to add guests to this hotel",
    );
  }

  const fullName = data.fullName.trim();
  const phone = data.phone?.trim();

  if (fullName.length === 0) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Full name cannot be empty",
    );
  }

  if (data.phone && phone.length === 0) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Phone number cannot be empty",
    );
  }

  const orConditions: any[] = [];

  if (data.phone?.trim()) {
    orConditions.push({ phone: data.phone.trim() });
  }

  if (data.idType && data.idNumber) {
    orConditions.push({
      idType: data.idType,
      idNumber: data.idNumber,
    });
  }

  const existingGuest = await prisma.guest.findFirst({
    where: {
      hotelId,
      OR: orConditions.length > 0 ? orConditions : undefined,
    },
  });

  if (existingGuest) {
    return existingGuest;
  }

  const newGuest = await prisma.guest.create({
    data: {
      fullName,
      phone,
      gender: data.gender,
      idType: data.idType,
      idNumber: data.idNumber,
      notes: data.notes,
      hotelId,
    },
  });

  return newGuest;
};

export const getAllGuestsService = async (
  hotelId: string,
  userId: string,
  query: GuestQuery,
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
      "You are not authorized to view guests of this hotel",
    );
  }

  const { filters, pagination, sort } = query;
  const whereClause: any = {
    hotelId,
  };

  // Apply filters
  if (filters.fullName) {
    whereClause.fullName = {
      contains: filters.fullName,
      mode: "insensitive",
    };
  }
  if (filters.phone) {
    whereClause.phone = filters.phone;
  }
  if (filters.idType) {
    whereClause.idType = filters.idType;
  }
  if (filters.idNumber) {
    whereClause.idNumber = filters.idNumber;
  }
  if (filters.gender) {
    whereClause.gender = filters.gender;
  }
  if (filters.notes) {
    whereClause.notes = {
      contains: filters.notes,
      mode: "insensitive",
    };
  }

  // Apply sorting
  const orderByClause: any = {};
  orderByClause[sort.field] = sort.order;

  const guests = await prisma.guest.findMany({
    where: whereClause,
    orderBy: orderByClause,
    skip: pagination.skip,
    take: pagination.limit,
  });

  return guests;
};

export const getGuestByIdService = async (
  hotelId: string,
  userId: string,
  guestId: string,
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
      "You are not authorized to view guests of this hotel",
    );
  }
  const guest = await prisma.guest.findFirst({
    where: {
      id: guestId,
      hotelId,
    },
  });

  if (!guest) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.GUEST_NOT_FOUND,
      "Guest not found",
    );
  }

  return guest;
};

export const updateGuestService = async (
  hotelId: string,
  userId: string,
  guestId: string,
  data: CreateGuestDto,
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
  const allowedRoles = ["HOTEL_OWNER", "MANAGER", "RECEPTIONIST"];

  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not authorized to update guests of this hotel",
    );
  }

  const fullName = data.fullName.trim();
  const phone = data.phone ? data.phone.trim() : undefined;

  if (fullName.length === 0) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Full name cannot be empty",
    );
  }

  if (data.phone && phone?.length === 0) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Phone number cannot be empty",
    );
  }

  // MUST HAVE at least one identifier to check duplicates
  if (!phone && !data.idType && !data.idNumber) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Provide at least phone or ID information",
    );
  }

  const orConditions: any[] = [];

  if (phone) {
    orConditions.push({ phone });
  }

  if (data.idType && data.idNumber) {
    orConditions.push({
      idType: data.idType,
      idNumber: data.idNumber,
    });
  }

  const duplicateGuest = await prisma.guest.findFirst({
    where: {
      hotelId,
      id: { not: guestId },
      OR: orConditions.length ? orConditions : undefined,
    },
  });

  if (duplicateGuest) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.GUEST_ALREADY_EXISTS,
      "Another guest with the same phone number or ID already exists",
    );
  }

  const guest = await prisma.guest.findFirst({
    where: {
      id: guestId,
      hotelId,
    },
  });

  if (!guest) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.GUEST_NOT_FOUND,
      "Guest not found",
    );
  }

  const updatedGuest = await prisma.guest.update({
    where: {
      id: guestId,
    },
    data: {
      fullName,
      phone,
      gender: data.gender,
      idType: data.idType,
      idNumber: data.idNumber,
      notes: data.notes,
    },
  });

  return updatedGuest;
};



export const deleteGuestService = async (
  hotelId: string,
  userId: string,
  guestId: string,
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
  const allowedRoles = ["HOTEL_OWNER", "MANAGER"];

  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not authorized to delete guests of this hotel",
    );
  }

  const guest = await prisma.guest.findFirst({
    where: {
      id: guestId,
      hotelId,
    },
  });

  if (!guest) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.GUEST_NOT_FOUND,
      "Guest not found",
    );
  }

  await prisma.guest.delete({
    where: {
      id: guestId,
    },
  });
};
