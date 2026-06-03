import { Request, Response } from "express";
import {
  createGuestService,
  getAllGuestsService,
  getGuestByIdService,
  updateGuestService,
  deleteGuestService,
} from "./guest.service";
import { parseGuestQuery } from "./guest.query";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import { successResponse } from "../../response";
import { HotelParams } from "../../types/params.types";


export const createGuestController = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;
  const data = req.body;

  const guest = await createGuestService(hotelId, userId, data);

  res.status(HttpCodes.CREATED).json(
    successResponse({
      message: "Guest created successfully",
      data: guest,
      code: AppCodes.GUEST_CREATED,
    }),
  );
};

export const getAllGuestsController = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;
  const query = parseGuestQuery(req);

  const guests = await getAllGuestsService(hotelId, userId, query);

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Guests retrieved successfully",
      data: guests,
      code: AppCodes.GUESTS_RETRIEVED,
    }),
   );
};

export const getGuestByIdController = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const guestId = req.params.guestId;
  const userId = req.user.userId;

  const guest = await getGuestByIdService(hotelId, userId, guestId);

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Guest retrieved successfully",
      data: guest,
      code: AppCodes.SUCCESS,
    }),
  );
};

export const updateGuestController = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const guestId = req.params.guestId;
  const userId = req.user.userId;
  const data = req.body;

  const guest = await updateGuestService(hotelId, userId, guestId, data);

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Guest updated successfully",
      data: guest,
      code: AppCodes.GUEST_UPDATED,
    }),
  );
};

export const deleteGuestController = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const guestId = req.params.guestId;
  const userId = req.user.userId;

  await deleteGuestService(hotelId, userId, guestId);

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Guest deleted successfully",
      data: null,
      code: AppCodes.GUEST_DELETED,
    }),
  );
};