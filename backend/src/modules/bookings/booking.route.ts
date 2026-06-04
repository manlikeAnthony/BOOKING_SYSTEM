import express from "express";
import {
  createBooking,
  getAllBookings,
  getSingleBooking,
  updateBooking,
  cancelBooking,
  getBookingsByGuest,
  getBookingsByRoom,
  confirmBooking,
  checkInBooking,
  checkOutBooking,
} from "./booking.controller";

import { asyncHandler } from "../../middlewares/async-handler";
import { authenticateUser } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validator.middleware";
import { createBookingSchema, updateBookingSchema } from "./booking.validator";

const router = express.Router({ mergeParams: true });

router.post(
  "/",
  authenticateUser,
  validate(createBookingSchema),
  asyncHandler(createBooking),
);
router.get("/", authenticateUser, asyncHandler(getAllBookings));
router.get(
  "/guest/:guestId",
  authenticateUser,
  asyncHandler(getBookingsByGuest),
);

router.get("/room/:roomId", authenticateUser, asyncHandler(getBookingsByRoom));

router.put(
  "/:bookingId",
  authenticateUser,
  validate(updateBookingSchema),
  asyncHandler(updateBooking),
);

router.get("/:bookingId", authenticateUser, asyncHandler(getSingleBooking));

router.post(
  "/:bookingId/confirm",
  authenticateUser,
  asyncHandler(confirmBooking),
);

router.post(
  "/:bookingId/check-in",
  authenticateUser,
  asyncHandler(checkInBooking),
);

router.post(
  "/:bookingId/check-out",
  authenticateUser,
  asyncHandler(checkOutBooking),
);

router.delete("/:bookingId", authenticateUser, asyncHandler(cancelBooking));

export default router;
