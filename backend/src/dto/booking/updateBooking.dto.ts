import {BookingSource} from "@prisma/client";

export interface UpdateBookingDTO {
  bookingId: string;
  guestId?: string;
  roomId?: string;

  bookingSource?: BookingSource;

  checkInDate?: Date;
  expectedCheckoutDate?: Date;

  totalAmount?: number;
}