import { prisma } from "../../config/database";
import { CustomError } from "../../errors/CustomError";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import {getMembership} from "../../utils/getMembership";
import { HotelRole } from "@prisma/client";

export const getRevenueAnalyticsService = async (
  hotelId: string,
  userId: string,
  startDate: Date,
  endDate: Date,
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
  const allowedRoles: HotelRole[] = ["HOTEL_OWNER", "MANAGER" , "ACCOUNTANT"];

  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not allowed to approve join requests for this hotel",
    );
  }


  const revenueData = await prisma.booking.findMany({
    where: {
      hotelId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"],
      },
    },
    select: {
      totalPaid: true,
      createdAt: true,
    },
  });

  const totalRevenue = revenueData.reduce(
    (sum, booking) => sum + booking.totalPaid,
    0,
  );

  const dailyRevenue = revenueData.reduce(
    (acc, booking) => {
      const dateKey = booking.createdAt.toISOString().split("T")[0];

      acc[dateKey] = (acc[dateKey] || 0) + booking.totalPaid;

      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    totalRevenue,
    dailyRevenue,
  };
};

export const getBookingStatsService = async (hotelId: string, userId: string) => {
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
  const allowedRoles: HotelRole[] = ["HOTEL_OWNER", "MANAGER" , "ACCOUNTANT"];

  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not allowed to view booking stats for this hotel",
    );
  }

  const [total , confirmed , pending , cancelled] = await Promise.all([
    prisma.booking.count({
      where: {
        hotelId,
      },
    }),
    prisma.booking.count({
      where: {
        hotelId,
        status: "CONFIRMED",
      },
    }),
    prisma.booking.count({
      where: {
        hotelId,
        status: "PENDING_PAYMENT",
      },
    }),
    prisma.booking.count({
      where: {
        hotelId,
        status: "CANCELLED",
      },
    }),
  ]);

  return {
    total,
    confirmed,
    pending,
    cancelled,
  };
};


export const getOccupancyRateService = async (hotelId: string, userId: string ) => {
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
  const allowedRoles: HotelRole[] = ["HOTEL_OWNER", "MANAGER" , "ACCOUNTANT"];

  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not allowed to view occupancy rate for this hotel",
    );
  }
  
  const totalRooms = await prisma.room.count({
    where: { hotelId },
  });

  const occupiedRooms = await prisma.room.count({
    where: {
      hotelId,
      status: "OCCUPIED",
    },
  });

  const rate = totalRooms === 0 ? 0 : (occupiedRooms / totalRooms) * 100;

  return {
    totalRooms,
    occupiedRooms,
    occupancyRate: rate.toFixed(2),
  };
};