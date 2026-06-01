import { Request, Response } from "express";
import {
  createHotelService,
  getPublicHotelsService,
  getHotelByIdService,
  deleteHotelService,
  updateHotelService,
} from "./hotel.service";

import { parseHotelQuery } from "./hotel.query";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import { CustomError } from "../../errors/CustomError";
import { CreateHotelDTO } from "../../dto/hotel/createHotel.dto";
import type { Params } from "../../types/auth.types";

export const createHotelController = async (req: Request, res: Response) => {
  const { name, email, phone, address } = req.body;
  const userId = req.user.userId;
  const data: CreateHotelDTO = {
    name,
    email,
    phone,
    address,
  };

  const hotel = await createHotelService(userId, data);

  res.status(HttpCodes.CREATED).json({
    code: AppCodes.HOTEL_CREATED,
    message: "Hotel created successfully",
    data: hotel,
  });
};

export const getAllHotelsController = async (req: Request, res: Response) => {
  const query = parseHotelQuery(req);

  const hotels = await getPublicHotelsService(query);

  res.status(HttpCodes.OK).json({
    code: AppCodes.SUCCESS,
    message: "Hotels retrieved successfully",
    data: hotels,
  });
};

export const getHotelByIdController = async (req: Request<Params>, res: Response) => {
  const hotelId = req.params.id;

  const hotel = await getHotelByIdService(hotelId);

  res.status(HttpCodes.OK).json({
    code: AppCodes.SUCCESS,
    message: "Hotel retrieved successfully",
    data: hotel,
  });
};


export const deleteHotelController = async (req: Request<Params>, res: Response) => {
  const hotelId = req.params.id;
  const userId = req.user.userId;

  await deleteHotelService(hotelId, userId);

  res.status(HttpCodes.OK).json({
    code: AppCodes.HOTEL_DELETED,
    data : null,
    message: "Hotel deleted successfully",
  });
};

export const updateHotelController = async (req: Request<Params>, res: Response) => {
  const hotelId = req.params.id;
  const userId = req.user.userId;
  const { name, email, phone, address } = req.body;

  const data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  } = {};

  if (name) data.name = name;
  if (email) data.email = email;
  if (phone) data.phone = phone;
  if (address) data.address = address;

  const hotel = await updateHotelService(hotelId,userId , data);

  res.status(HttpCodes.OK).json({
    code: AppCodes.HOTEL_UPDATED,
    message: "Hotel updated successfully",
    data: hotel,
  });
};