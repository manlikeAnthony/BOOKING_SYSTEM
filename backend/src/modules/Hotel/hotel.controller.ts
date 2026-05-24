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
  const userId = req.user.userId;
  const query = parseHotelQuery(req);

  const hotels = await getPublicHotelsService(query);

  res.status(HttpCodes.OK).json({
    code: AppCodes.SUCCESS,
    message: "Hotels retrieved successfully",
    data: hotels,
  });
};

