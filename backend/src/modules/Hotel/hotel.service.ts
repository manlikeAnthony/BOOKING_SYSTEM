import { prisma } from "../../config/database";
import slugify from "slugify";
import { CustomError } from "../../errors/CustomError";
import { HttpCodes } from "../../errors/HttpCodes";
import { AppCodes } from "../../errors/AppCodes";
import { HotelQuery } from "./hotel.query";

export const createHotelService = async (
  userId: string,
  data: {
    name: string;
    email?: string;
    phone: string;
    address: string;
  },
) => {
  const { name, email, phone, address } = data;

  if (!name || !phone || !address) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.MISSING_REQUIRED_FIELDS,
      "Name, phone, and address are required",
    );
  }

  const slug = slugify(name, {
    lower: true,
    strict: true,
  });

  const existingHotel = await prisma.hotel.findUnique({
    where: { slug },
  });

  if (existingHotel) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.HOTEL_ALREADY_EXISTS,
      "A hotel with the same name already exists",
    );
  }

  const hotel = await prisma.hotel.create({
    data: {
      name,
      slug,
      email,
      phone,
      address,
      members: {
        create: {
          userId,
          role: "HOTEL_OWNER",
        },
      },
    },
    include: {
      members: true,
    },
  });

  return hotel;
};

export const getPublicHotelsService = async (query: HotelQuery) => {
  const { filters, sort, pagination } = query;

  const where: any = {};

  if (filters.search) {
    where.OR = [
      {
        name: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        address: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }
  const hotels = await prisma.hotel.findMany({
    where,
    skip: pagination.skip,
    take: pagination.limit,
    orderBy: {
      [sort.field]: sort.order,
    },
    include: {
      members: true,
    },
  });

  const totalHotels = await prisma.hotel.count({
    where,
  });

  return {
    hotels,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: totalHotels,
      totalPages: Math.ceil(totalHotels / pagination.limit),
    },
  };
};


export const getHotelByIdService = async (hotelId: string) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: {
      members: true,
    },
  });

  if (!hotel) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.HOTEL_NOT_FOUND,
      "Hotel not found",
    );
  }

  return hotel;
};

export const deleteHotelService = async (hotelId: string) => {
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

  await prisma.hotel.delete({
    where: { id: hotelId },
  });

  return;
};

export const updateHotelService = async (
  hotelId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  },
) => {
  const { name, email, phone, address } = data;

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

  let slug: string | undefined;

  if (name && name !== hotel.name) {
    slug = slugify(name, {
      lower: true,
      strict: true,
    });

    const existingHotel = await prisma.hotel.findUnique({
      where: { slug },
    });

    if (existingHotel && existingHotel.id !== hotelId) {
      CustomError.throwError(
        HttpCodes.BAD_REQUEST,
        AppCodes.HOTEL_ALREADY_EXISTS,
        "A hotel with the same name already exists",
      );
    }
  }

  const updatedHotel = await prisma.hotel.update({
    where: { id: hotelId },
    data: {
      name,
      slug,
      email,
      phone,
      address,
    },
    include: {
      members: true,
    },
  });

  return updatedHotel;
};
