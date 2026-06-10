import express from "express";
import {
  createPayment,
  initializeOnlinePayment,
  verifyOnlinePayment,
  confirmPayment,
  getAllPayments,
  getSinglePayment,
  getPaymentsForBooking,
} from "./payment.controller";

import { authenticateUser } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validator.middleware";
import {
  createPaymentSchema,
  confirmPaymentSchema,
  initializeOnlinePaymentSchema,
} from "./payment.validator";
import { asyncHandler } from "../../middlewares/async-handler";

const router = express.Router();

router.post(
  "/hotels/:hotelId/bookings/:bookingId/payments",
  authenticateUser,
  validate(createPaymentSchema),
  asyncHandler(createPayment),
);

router.post(
  "/hotels/:hotelId/bookings/:bookingId/payments/online",
  authenticateUser,
  validate(initializeOnlinePaymentSchema),
  asyncHandler(initializeOnlinePayment),
);

router.post(
  "/hotels/:hotelId/bookings/:bookingId/payments/confirm",
  authenticateUser,
  validate(confirmPaymentSchema),
  asyncHandler(confirmPayment),
);

router.get(
  "/hotels/:hotelId/payments",
  authenticateUser,
  asyncHandler(getAllPayments),
);

router.get(
  "/hotels/:hotelId/payments/:paymentId",
  authenticateUser,
  asyncHandler(getSinglePayment),
);

router.get(
  "/hotels/:hotelId/bookings/:bookingId/payments",
  authenticateUser,
  asyncHandler(getPaymentsForBooking),
);

router.post(
  "/payments/verify",
  authenticateUser,
  asyncHandler(verifyOnlinePayment),
);

export default router;