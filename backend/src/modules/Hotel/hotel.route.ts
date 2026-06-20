import express from "express";

const router = express.Router();
import {
  createHotelController,
  getAllHotelsController,
  getHotelByIdController,
  deleteHotelController,
  updateHotelController,
  adminActivateHotelController,
  adminDeactivateHotelController
} from "./hotel.controller";

import { asyncHandler } from "../../middlewares/async-handler";
import { authenticateUser , authorizeRoles} from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validator.middleware";
import { createHotelSchema, updateHotelSchema } from "./hotel.validator";

import roomRouter from "../rooms/room.route";
import bookingRouter from "../bookings/booking.route";
import guestRouter from "../Guest/guest.route";
import hotelMemberRouter from "../HotelMember/hotelMember.route";
import analyticsRouter from "../analytics/analytics.route";

router.use("/:hotelId/rooms", roomRouter);
router.use("/:hotelId/bookings", bookingRouter);
router.use("/:hotelId/guests", guestRouter);
router.use("/:hotelId/members", hotelMemberRouter);
router.use("/:hotelId/analytics", analyticsRouter);

router.post(
  "/",
  authenticateUser,
  validate(createHotelSchema),
  asyncHandler(createHotelController),
);
router.get("/", asyncHandler(getAllHotelsController));
router.get("/:id", asyncHandler(getHotelByIdController));
router.delete("/:id", authenticateUser, asyncHandler(deleteHotelController));
router.patch(
  "/:id",
  authenticateUser,
  validate(updateHotelSchema),
  asyncHandler(updateHotelController),
);

router.post(
  "/:id/activate",
  authenticateUser,
  authorizeRoles("SUPER_ADMIN"),
  asyncHandler(adminActivateHotelController)
);

router.post(
  "/:id/deactivate",
  authenticateUser,
  authorizeRoles("SUPER_ADMIN"),
  asyncHandler(adminDeactivateHotelController)
);

export default router;
