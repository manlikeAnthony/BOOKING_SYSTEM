import { Request, Response } from "express";
import {
  createRoomService,
  getAllRoomsService,
  getRoomsByHotelIdService,
  updateRoomService,
  deleteRoomService,
  deactivateRoomsByHotelIdService,
  getSingleRoomService,
} from "./room.service";

import { parseRoomQuery } from "./room.query";
import { HotelParams } from "../../types/params.types";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import { successResponse } from "../../response";

export const createRoom = async (req: Request<HotelParams>, res: Response) => {
  const userId = req.user.userId;
  const hotelId = req.params.hotelId;
  const data = req.body;

  const room = await createRoomService(userId, hotelId, data);

  res.status(HttpCodes.CREATED).json(
    successResponse({
      message: "Room created successfully",
      data: room,
      code: AppCodes.ROOM_CREATED,
    }),
  );
};

export const getAllRooms = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const query = parseRoomQuery(req);

  const rooms = await getAllRoomsService(hotelId, query);

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Rooms retrieved successfully",
      data: rooms,
      code: AppCodes.ROOMS_RETRIEVED,
    }),
  );
};

export const getRoomsByHotelId = async (req: Request<HotelParams>, res: Response) => {
    const hotelId = req.params.hotelId;
    const rooms = await getRoomsByHotelIdService(hotelId);

    res.status(HttpCodes.OK).json(
        successResponse({
            message: "Rooms retrieved successfully",
            data: rooms,
            code: AppCodes.ROOMS_RETRIEVED,
        }),
    );
};

export const getSingleRoom = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const roomId = req.params.roomId;

  const room = await getSingleRoomService(hotelId, roomId);

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Room retrieved successfully",
      data: room,
      code: AppCodes.ROOM_RETRIEVED,
    }),
  );
}

export const updateRoom = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const roomId = req.params.roomId;
  const userId = req.user.userId;
  const data = req.body;

  const updatedRoom = await updateRoomService(hotelId, roomId, data, userId);

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Room updated successfully",
      data: updatedRoom,
      code: AppCodes.ROOM_UPDATED,
    }),
  );
};

export const deleteRoom = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const roomId = req.params.roomId;
  const userId = req.user.userId;

  await deleteRoomService(hotelId, roomId, userId);

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Room deleted successfully",
      code: AppCodes.ROOM_DELETED,
      data: null,
    }),
  );
};

export const deactivateRoomsByHotelId = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;

  await deactivateRoomsByHotelIdService(hotelId, userId);

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Rooms deactivated successfully",
      code: AppCodes.ROOMS_DEACTIVATED,
      data: null,
    }),
  );
}
