import { Request, Response } from "express";

import {
    createBookingService,
    createPublicBookingService,
    getAllBookingsService,
    getSingleBookingService,
    updateBookingService,
    cancelBookingService,
    getBookingsByGuestId,
    getBookingsByRoomId,
    confirmBookingService,
    checkInBookingService,
    checkOutBookingService,
} from "./booking.service";

import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import { successResponse } from "../../response";
import { parseBookingQuery } from "./booking.query";
import { CreateBookingDTO, CreatePublicBookingDTO } from "../../dto/booking/createBooking.dto";
import { HotelParams } from "../../types/params.types";
import { UpdateBookingDTO } from "../../dto/booking/updateBooking.dto";

export const createBooking = async (req: Request<HotelParams>, res: Response) => {
  const { hotelId } = req.params;
  const userId = req.user.userId;
    
  const bookingData:CreateBookingDTO  = req.body;

    const newBooking = await createBookingService(hotelId, userId, bookingData);

    res.status(HttpCodes.CREATED).json(successResponse({
        message: "Booking created successfully",
        data: newBooking,
        code: AppCodes.RESOURCE_CREATED,
    }));
}

export const createPublicBooking = async (req: Request, res: Response) => {
  const bookingData = req.body as CreatePublicBookingDTO;
  
  const newBooking = await createPublicBookingService(bookingData);

  res.status(HttpCodes.CREATED).json(successResponse({
    message: "Booking created successfully",
    data: newBooking,
    code: AppCodes.RESOURCE_CREATED,
  }));
}

export const getAllBookings = async (req: Request<HotelParams>, res: Response) => {
  const { hotelId } = req.params;
  const userId = req.user.userId;
  const query = parseBookingQuery(req);

  const bookings = await getAllBookingsService(hotelId, userId, query);

  res.status(HttpCodes.OK).json(successResponse({
    message: "Bookings retrieved successfully",
    data: bookings,
    code: AppCodes.SUCCESS,
  }));
};

export const getSingleBooking = async (req: Request<HotelParams>, res: Response) => {
  const { hotelId, bookingId } = req.params;
  const userId = req.user.userId;

  const booking = await getSingleBookingService(hotelId, userId, bookingId);

  res.status(HttpCodes.OK).json(successResponse({
    message: "Booking retrieved successfully",
    data: booking,
    code: AppCodes.SUCCESS,
  }));
};

export const getBookingsByGuest = async (req: Request<HotelParams>, res: Response) => {
  const { hotelId, guestId } = req.params;
  const userId = req.user.userId;

  const bookings = await getBookingsByGuestId(hotelId, userId, guestId);

  res.status(HttpCodes.OK).json(successResponse({
    message: "Bookings retrieved successfully",
    data: bookings,
    code: AppCodes.SUCCESS,
  }));
};

export const getBookingsByRoom = async (req: Request<HotelParams>, res: Response) => {
  const { hotelId, roomId } = req.params;
  const userId = req.user.userId;

  const bookings = await getBookingsByRoomId(hotelId, userId, roomId);

  res.status(HttpCodes.OK).json(successResponse({
    message: "Bookings retrieved successfully",
    data: bookings,
    code: AppCodes.SUCCESS,
  }));
};

export const updateBooking = async (req: Request<HotelParams>, res: Response) => {
  const { hotelId, bookingId } = req.params;
  const userId = req.user.userId;
  const updateData: UpdateBookingDTO = req.body;

  const updatedBooking = await updateBookingService(hotelId, userId, bookingId, updateData);

  res.status(HttpCodes.OK).json(successResponse({
    message: "Booking updated successfully",
    data: updatedBooking,
    code: AppCodes.RESOURCE_UPDATED,
  }));
};

export const cancelBooking = async (req: Request<HotelParams>, res: Response) => {
  const { hotelId, bookingId } = req.params;
  const userId = req.user.userId;

  await cancelBookingService(hotelId, userId, bookingId);

  res.status(HttpCodes.OK).json(successResponse({
    message: "Booking cancelled successfully",
    data: null,
    code: AppCodes.RESOURCE_UPDATED,
  }));
}

export const confirmBooking = async (req: Request<HotelParams>, res: Response) => {
  const { hotelId, bookingId } = req.params;
  const userId = req.user.userId;

  const confirmedBooking = await confirmBookingService(hotelId, userId, bookingId);

  res.status(HttpCodes.OK).json(successResponse({
    message: "Booking confirmed successfully",
    data: confirmedBooking,
    code: AppCodes.RESOURCE_UPDATED,
  }));
}

export const checkInBooking = async (req: Request<HotelParams>, res: Response) => {
  const { hotelId, bookingId } = req.params;
  const userId = req.user.userId;

  const checkedInBooking = await checkInBookingService(hotelId, userId, bookingId);

  res.status(HttpCodes.OK).json(successResponse({
    message: "Guest checked in successfully",
    data: checkedInBooking,
    code: AppCodes.RESOURCE_UPDATED,
  }));
}

export const checkOutBooking = async (req: Request<HotelParams>, res: Response) => {
  const { hotelId, bookingId } = req.params;
  const userId = req.user.userId;

  const checkedOutBooking = await checkOutBookingService(hotelId, userId, bookingId);

  res.status(HttpCodes.OK).json(successResponse({
    message: "Guest checked out successfully",
    data: checkedOutBooking,
    code: AppCodes.RESOURCE_UPDATED,
  }));
}
