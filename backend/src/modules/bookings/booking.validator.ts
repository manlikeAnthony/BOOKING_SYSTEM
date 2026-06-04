import Joi from "joi";

export const createBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  hotelId: Joi.string().required(),
  guestId: Joi.string().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  bookingSource: Joi.string()
    .valid("WALK_IN", "PHONE", "ONLINE", "AGENT", "WHATSAPP")
    .required(),
});

export const updateBookingSchema = Joi.object({
  roomId: Joi.string().optional(),
  hotelId: Joi.string().optional(),
  guestId: Joi.string().optional(),
  checkInDate: Joi.date().iso().optional(),
  expectedCheckoutDate: Joi.date().iso().optional(),
  bookingSource: Joi.string().valid("WALK_IN", "PHONE", "ONLINE", "AGENT", "WHATSAPP"),
});
