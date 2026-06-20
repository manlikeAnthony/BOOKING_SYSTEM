import { Request, Response } from "express";
import {
  getRevenueAnalyticsService,
  getBookingStatsService,
  getOccupancyRateService,
} from "./analytics.service";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import { successResponse } from "../../response";
import { HotelParams } from "../../types/params.types";

export const getRevenueAnalyticsController = async (
  req: Request<HotelParams>,
  res: Response,
) => {
  const { hotelId } = req.params;
  const userId = req.user.userId;

  let startDate: Date;
  let endDate: Date;

  if (req.query.startDate && req.query.endDate) {
    startDate = new Date(req.query.startDate as string);
    endDate = new Date(req.query.endDate as string);
  } else {
    const now = new Date();

    startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
  }

  const analytics = await getRevenueAnalyticsService(
    hotelId,
    userId,
    startDate,
    endDate,
  );

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Revenue analytics retrieved successfully",
      data: analytics,
      code: AppCodes.SUCCESS,
    }),
  );
};


export const getBookingStatsController = async (
  req: Request<HotelParams>,
  res: Response,
) => {
  const { hotelId } = req.params;
  const userId = req.user.userId;

  const stats = await getBookingStatsService(hotelId, userId);

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Booking stats retrieved successfully",
      data: stats,
      code: AppCodes.SUCCESS,
    }),
  );
};

export const getOccupancyRateController = async (
  req: Request<HotelParams>,
  res: Response,
) => {
  const { hotelId } = req.params;
  const userId = req.user.userId;

  const occupancyRate = await getOccupancyRateService(hotelId, userId);

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Occupancy rate retrieved successfully",
      data: occupancyRate,
      code: AppCodes.SUCCESS,
    }),
  );
};