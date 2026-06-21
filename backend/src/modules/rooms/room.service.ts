import { prisma } from "../../config/database";
import { CustomError } from "../../errors/CustomError";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import { CreateRoomDTO } from "../../dto/room/createRoom.dto";
import { getMembership } from "../../utils/getMembership";
import { RoomQuery } from "./room.query";
import { redis } from "../../config/redis";

const deleteRoomListCache = async (hotelId: string) => {
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      `hotel:${hotelId}:rooms:list:*`,
      "COUNT",
      100
    );

    cursor = nextCursor;

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== "0");
};

export const createRoomService = async (
  userId: string,
  hotelId: string,
  data: CreateRoomDTO,
) => {
  const hotel = await prisma.hotel.findUnique({
    where: {
      id: hotelId,
    },
  });

  if (!hotel) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.HOTEL_NOT_FOUND,
      `No hotel with id ${hotelId} found`,
    );
  }

  const membership = await getMembership(hotelId, userId);
  const allowedRoles = ["HOTEL_OWNER", "MANAGER"];
  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not authorize to create rooms in this hotel",
    );
  }
  const { roomNumber, price, type, capacity } = data;

  if (price < 0 || capacity < 0) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Price and Capacity must be greater than 0",
    );
  }

  const normalizedRoomNumber = roomNumber.trim().toUpperCase();

  const existingRoom = await prisma.room.findFirst({
    where: {
      hotelId,
      roomNumber: normalizedRoomNumber,
    },
  });
  if (existingRoom) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.ROOM_ALREADY_EXISTS,
      `Room with roomNumber ${roomNumber} already exists`,
    );
  }

  const room = await prisma.room.create({
    data: {
      hotelId,
      roomNumber: normalizedRoomNumber,
      price,
      type,
      capacity,
      status: "AVAILABLE",
    },
  });

  await deleteRoomListCache(hotelId); // Invalidate the cache for the hotel's rooms
  return room;
};

export const getAllRoomsService = async (hotelId: string, query: RoomQuery) => {
  const { filters, pagination, sort } = query;

const cacheKey =
  `hotel:${hotelId}:rooms:list:` +
  `${pagination.page}:${pagination.limit}:` +
  `${sort.field}:${sort.order}:` +
  `${filters.roomNumber ?? "all"}:` +
  `${filters.price ?? "all"}:` +
  `${filters.type ?? "all"}:` +
  `${filters.capacity ?? "all"}:` +
  `${filters.isActive ?? "all"}:` +
  `${filters.status ?? "all"}`;

  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const whereClause: any = {
    hotelId,
  };

  // Apply filters
  if (filters.roomNumber) {
    whereClause.roomNumber = filters.roomNumber;
  }
  if (filters.price !== undefined) {
    whereClause.price = filters.price;
  }
  if (filters.type) {
    whereClause.type = filters.type;
  }
  if (filters.capacity !== undefined) {
    whereClause.capacity = filters.capacity;
  }
  if (filters.isActive !== undefined) {
    whereClause.isActive = filters.isActive;
  }
  if (filters.status) {
    whereClause.status = filters.status;
  }

  // Apply sorting
  const orderByClause: any = {};
  orderByClause[sort.field] = sort.order;

  // Fetch rooms with pagination, filtering, and sorting
  const rooms = await prisma.room.findMany({
    where: whereClause,
    orderBy: orderByClause,
    skip: pagination.skip,
    take: pagination.limit,
  });

  const totalRooms = await prisma.room.count({
    where: whereClause,
  });

  // Cache the result
  await redis.setex(
    cacheKey,
    3600,
    JSON.stringify({
      rooms,
      total: totalRooms,
      page: pagination.page,
      limit: pagination.limit,
    }),
  );

  return {
    rooms,
    total: totalRooms,
    page: pagination.page,
    limit: pagination.limit,
  };
};

export const getSingleRoomService = async (hotelId: string, roomId: string) => {
  const cacheKey = `room:${roomId}`;
  const cachedRoom = await redis.get(cacheKey);
  if (cachedRoom) {
    return JSON.parse(cachedRoom);
  }
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      hotelId,
    },
  });

  if (!room) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.ROOM_NOT_FOUND,
      `No room with id ${roomId} found in hotel ${hotelId}`,
    );
  }

  await redis.setex(cacheKey, 3600, JSON.stringify(room));

  return room;
};

export const deleteRoomService = async (
  hotelId: string,
  roomId: string,
  userId: string,
) => {
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      hotelId,
    },
  });

  if (!room) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.ROOM_NOT_FOUND,
      `No room with id ${roomId} found in hotel ${hotelId}`,
    );
  }
  const membership = await getMembership(hotelId, userId);
  const allowedRoles = ["HOTEL_OWNER", "MANAGER"];

  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not authorized to delete rooms in this hotel",
    );
  }

  await prisma.room.delete({
    where: {
      id: roomId,
    },
  });
  await deleteRoomListCache(hotelId);
  await redis.del(`room:${roomId}`);
};

export const updateRoomService = async (
  hotelId: string,
  roomId: string,
  data: Partial<CreateRoomDTO>,
  userId: string,
) => {
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      hotelId,
    },
  });

  if (!room) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.ROOM_NOT_FOUND,
      `No room with id ${roomId} found in hotel ${hotelId}`,
    );
  }
  const membership = await getMembership(hotelId, userId);
  const allowedRoles = ["HOTEL_OWNER", "MANAGER"];
  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not authorized to update rooms in this hotel",
    );
  }

  if (data.roomNumber) {
    const normalizedRoomNumber = data.roomNumber.trim().toUpperCase();

    const existingRoom = await prisma.room.findFirst({
      where: {
        hotelId,
        roomNumber: normalizedRoomNumber,
        id: {
          not: roomId,
        },
      },
    });
    if (existingRoom) {
      CustomError.throwError(
        HttpCodes.BAD_REQUEST,
        AppCodes.ROOM_ALREADY_EXISTS,
        `Room with roomNumber ${data.roomNumber} already exists`,
      );
    }
  }

  if (data.price !== undefined && data.price < 0) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Price must be greater than 0",
    );
  }

  if (data.capacity !== undefined && data.capacity < 0) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Capacity must be greater than 0",
    );
  }

  const updatedRoom = await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      roomNumber: data.roomNumber
        ? data.roomNumber.trim().toUpperCase()
        : undefined,
      price: data.price,
      type: data.type,
      capacity: data.capacity,
    },
  });

  await deleteRoomListCache(hotelId); // Invalidate the cache for the hotel's rooms
  await redis.del(`room:${roomId}`); // Invalidate the cache for the specific room
  return updatedRoom;
};


export const deactivateRoomsByHotelIdService = async (
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
  const allowedRoles = ["HOTEL_OWNER", "MANAGER"];
  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not authorized to deactivate rooms in this hotel",
    );
  }

  await prisma.room.updateMany({
    where: {
      hotelId,
    },
    data: {
      isActive: false,
    },
  });

  await deleteRoomListCache(hotelId); // Invalidate the cache for the hotel's rooms
};
