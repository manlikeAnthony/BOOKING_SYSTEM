import { BookingSource } from "@prisma/client";

export interface CreateBookingDTO {
  guestId: string;
  roomId: string;

  bookingSource: BookingSource;

  checkInDate: Date;
  expectedCheckoutDate?: Date;

  totalAmount?: number;
}