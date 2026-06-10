import { BookingSource } from "@prisma/client";

export interface CreateBookingDTO {
  guestId: string;
  roomId: string;

  bookingSource: BookingSource;

  checkInDate: Date;
  expectedCheckoutDate?: Date;

}

export interface CreatePublicBookingDTO {
  hotelId: string;
  roomId: string;

  fullName: string;
  phone: string;
  email: string;

  checkInDate: string;
  expectedCheckoutDate: string;
}