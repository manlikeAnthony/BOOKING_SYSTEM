import { prisma } from "../../config/database";
import { CustomError } from "../../errors/CustomError";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import { CreateBookingDTO } from "../../dto/booking/createBooking.dto";
import { getMembership } from "../../utils/getMembership";
import { BookingQuery } from "./booking.query";

export const createBookingService = async (
  hotelId: string,
  userId: string,
  data: CreateBookingDTO,
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
      "You are not authorized to create bookings for this hotel",
    );
  }

  const checkIn = new Date(data.checkInDate);
  const checkOut = data.expectedCheckoutDate
    ? new Date(data.expectedCheckoutDate)
    : new Date("9999-12-31");

  if (checkIn >= checkOut) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Check-in date must be before checkout date",
    );
  }

  const guest = await prisma.guest.findFirst({
    where: {
      id: data.guestId,
      hotelId,
    },
  });

  const room = await prisma.room.findFirst({
    where: {
      id: data.roomId,
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

  if (!room) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.ROOM_NOT_FOUND,
      "Room not found",
    );
  }

  if (room.status === "MAINTENANCE") {
    CustomError.throwError(
      HttpCodes.CONFLICT,
      AppCodes.ROOM_UNAVAILABLE,
      "Room is not available for booking",
    );
  }

  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      roomId: data.roomId,
      hotelId,
      status: {
        in: ["PENDING", "CONFIRMED", "RESERVED", "CHECKED_IN"],
      },
      AND: [
        {
          checkInDate: {
            lt: checkOut,
          },
        },
        {
          OR: [
            {
              expectedCheckoutDate: {
                gt: checkIn,
              },
            },
            {
              expectedCheckoutDate: null,
            },
          ],
        },
      ],
    },
  });

  if (conflictingBooking) {
    CustomError.throwError(
      HttpCodes.CONFLICT,
      AppCodes.BOOKING_CONFLICT,
      "Booking conflict found",
    );
  }

  const booking = await prisma.booking.create({
    data: {
      hotelId,
      guestId: data.guestId,
      roomId: data.roomId,
      bookingSource: data.bookingSource,
      createdById: membership.id,
      checkInDate: checkIn,
      expectedCheckoutDate: data.expectedCheckoutDate ? checkOut : null,
      totalAmount: data.totalAmount ?? 0,
      status: "PENDING",
    },
  });

  return booking;
};

export const getAllBookingsService = async (
  hotelId: string,
  userId: string,
  query: BookingQuery,
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
      "Hotel not found",
    );
  }

  const membership = await getMembership(hotelId, userId);
  if (!membership) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not authorized to view bookings of this hotel",
    );
  }

  const { filters, pagination, sort } = query;
  const whereClause: any = {
    hotelId,
  };

  if (filters.createdBy) {
    whereClause.createdById = filters.createdBy;
  }

  if (filters.bookingSource) {
    whereClause.bookingSource = filters.bookingSource;
  }
  if (filters.status) {
    whereClause.status = filters.status;
  }

  const orderByClause: any = {};
  orderByClause[sort.field] = sort.order;

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    orderBy: orderByClause,
    include: {
      guest: true,
      room: true,
      createdBy: {
        include: {
          user: true,
        },
      },
      checkedInBy: {
        include: {
          user: true,
        },
      },
    },
    skip: pagination.skip,
    take: pagination.limit,
  });

  return bookings;
};

export const getSingleBookingService = async (
  hotelId: string,
  userId: string,
  bookingId: string,
) => {
  const hotel = await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
  });
  if (!hotel) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.HOTEL_NOT_FOUND,
      "No hotel found",
    );
  }

  const membership = await getMembership(hotelId, userId);
  if (!membership) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not authorized to view booking of this hote",
    );
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      hotelId,
    },
    include: {
      guest: true,
      room: true,
      createdBy: {
        include: {
          user: true,
        },
      },
      checkedInBy: {
        include: {
          user: true,
        },
      },
    },
  });
  if (!booking) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.BOOKING_NOT_FOUND,
      "Booking not found",
    );
  }

  return booking;
};

import { Prisma } from "@prisma/client";

export const updateBookingService = async (
  hotelId: string,
  userId: string,
  bookingId: string,
  data: Partial<CreateBookingDTO>,
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

  const allowedRoles = [
    "HOTEL_OWNER",
    "MANAGER",
    "RECEPTIONIST",
  ];

  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.UNAUTHORIZED,
      "You are not authorized to update bookings for this hotel",
    );
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      hotelId,
    },
  });

  if (!booking) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.BOOKING_NOT_FOUND,
      "Booking not found",
    );
  }

  // Terminal states cannot be modified
  if (
    booking.status === "CHECKED_OUT" ||
    booking.status === "CANCELLED" ||
    booking.status === "NO_SHOW"
  ) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Cannot update a booking that is already checked-out, cancelled or marked as no-show",
    );
  }

  const newCheckIn = data.checkInDate
    ? new Date(data.checkInDate)
    : booking.checkInDate;

  const newCheckOut = data.expectedCheckoutDate
    ? new Date(data.expectedCheckoutDate)
    : booking.expectedCheckoutDate;

  if (newCheckOut && newCheckIn >= newCheckOut) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Check-in date must be before checkout date",
    );
  }

  const updateData: Prisma.BookingUpdateInput = {};

  // Guest validation
  if (data.guestId) {
    const guest = await prisma.guest.findFirst({
      where: {
        id: data.guestId,
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

    updateData.guest = {
      connect: {
        id: guest.id,
      },
    };
  }

  // Room validation
  if (data.roomId) {
    const room = await prisma.room.findFirst({
      where: {
        id: data.roomId,
        hotelId,
      },
    });

    if (!room) {
      CustomError.throwError(
        HttpCodes.NOT_FOUND,
        AppCodes.ROOM_NOT_FOUND,
        "Room not found",
      );
    }

    if (room.status === "MAINTENANCE") {
      CustomError.throwError(
        HttpCodes.CONFLICT,
        AppCodes.ROOM_UNAVAILABLE,
        "Room is not available for booking",
      );
    }

    updateData.room = {
      connect: {
        id: room.id,
      },
    };
  }

  // Only run conflict detection if room/dates are changing
  if (
    data.roomId ||
    data.checkInDate ||
    data.expectedCheckoutDate
  ) {
    const roomIdToCheck = data.roomId ?? booking.roomId;

    const conflictCheckOut =
      newCheckOut ?? new Date("9999-12-31");

    const conflictingBooking =
      await prisma.booking.findFirst({
        where: {
          id: {
            not: bookingId,
          },
          hotelId,
          roomId: roomIdToCheck,

          status: {
            in: [
              "PENDING",
              "CONFIRMED",
              "RESERVED",
              "CHECKED_IN",
            ],
          },

          AND: [
            {
              checkInDate: {
                lt: conflictCheckOut,
              },
            },
            {
              OR: [
                {
                  expectedCheckoutDate: {
                    gt: newCheckIn,
                  },
                },
                {
                  expectedCheckoutDate: null,
                },
              ],
            },
          ],
        },
      });

    if (conflictingBooking) {
      CustomError.throwError(
        HttpCodes.CONFLICT,
        AppCodes.BOOKING_CONFLICT,
        "Booking dates conflict with an existing booking",
      );
    }
  }

  if (data.checkInDate) {
    updateData.checkInDate = newCheckIn;
  }

  if (data.expectedCheckoutDate) {
    updateData.expectedCheckoutDate = newCheckOut;
  }

  if (data.bookingSource) {
    updateData.bookingSource = data.bookingSource;
  }

  if (data.totalAmount !== undefined) {
    updateData.totalAmount = data.totalAmount;
  }

  const updatedBooking = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: updateData,
    include: {
      guest: true,
      room: true,
      createdBy: {
        include: {
          user: true,
        },
      },
      checkedInBy: {
        include: {
          user: true,
        },
      },
    },
  });

  return updatedBooking;
};

export const cancelBookingService = async (
  hotelId: string,
  userId: string,
  bookingId: string,
) => {
  const hotel = await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
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
      "You are not authorized to cancel bookings for this hotel",
    );
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      hotelId,
    },
  });
  if (!booking) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.BOOKING_NOT_FOUND,
      "Booking not found",
    );
  }

  if (booking.status === "CHECKED_IN") {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Cannot cancel a booking that is already checked in",
    );
  }

  if(booking.status === "CANCELLED") {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Booking is already cancelled",
    );
  }

  const cancelBooking = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: "CANCELLED",
    },
  });

  return cancelBooking;
};

export const getBookingsByGuestId = async (
  hotelId: string,
  userId: string,
  guestId: string,
) => {
  const hotel = await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
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
      "You are not authorized to view bookings of this hotel",
    );
  }

  const whereClause: any = {
    hotelId,
    guestId,
  };

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      guest: true,
      room: true,
      createdBy: {
        include: {
          user: true,
        },
      },
      checkedInBy: {
        include: {
          user: true,
        },
      },
    },
  });

  return bookings;
};

export const getBookingsByRoomId = async (
  hotelId: string,
  userId: string,
  roomId: string,
) => {
  const hotel = await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
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
      "You are not authorized to view bookings of this hotel",
    );
  }


  const whereClause: any = {
    hotelId,
    roomId,
  };


  const bookings = await prisma.booking.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      guest: true,
      room: true,
      createdBy: {
        include: {
          user: true,
        },
      },
      checkedInBy: {
        include: {
          user: true,
        },
      },
    },
  });

  return bookings;
};

export const confirmBookingService = async (
  hotelId: string,
  userId: string,
  bookingId: string,
) => {
  const hotel = await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
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
      "You are not authorized to confirm bookings for this hotel",
    );
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      hotelId,
    },
  });
  if (!booking) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.BOOKING_NOT_FOUND,
      "Booking not found",
    );
  }

  if (booking.status !== "PENDING") {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Only pending bookings can be confirmed",
    );
  }

  const updatedBooking = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: "CONFIRMED",
    },
  });

  return updatedBooking;
};

export const checkInBookingService = async (
  hotelId: string,
  userId: string,
  bookingId: string,
) => {
  const hotel = await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
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
      "You are not authorized to check-in bookings for this hotel",
    );
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      hotelId,
    },
  });
  if (!booking) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.BOOKING_NOT_FOUND,
      "Booking not found",
    );
  }

  if (booking.status !== "CONFIRMED") {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Only confirmed bookings can be checked-in",
    );
  }
  const updatedBooking = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: "CHECKED_IN",
        checkedInById: membership.id,
      },
    });

    await tx.room.update({
      where: {
        id: booking.roomId,
      },
      data: {
        status: "OCCUPIED",
      },
    });

    return booking;
  });
  return updatedBooking;
};

export const checkOutBookingService = async (
  hotelId: string,
  userId: string,
  bookingId: string,
) => {
  const hotel = await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
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
      "You are not authorized to check-out bookings for this hotel",
    );
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      hotelId,
    },
  });
  if (!booking) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.BOOKING_NOT_FOUND,
      "Booking not found",
    );
  }

  if (booking.status !== "CHECKED_IN") {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Only checked-in bookings can be checked-out",
    );
  }
  const updatedBooking = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: "CHECKED_OUT",
      },
    });

    await tx.room.update({
      where: {
        id: booking.roomId,
      },
      data: {
        status: "AVAILABLE",
      },
    });

    return booking;
  });

  return updatedBooking;
};
