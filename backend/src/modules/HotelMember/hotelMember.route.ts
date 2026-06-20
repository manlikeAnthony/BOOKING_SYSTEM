import express from "express";
const router = express.Router({mergeParams: true});

import {
  addHotelMemberController,
  requestJoinHotelController,
  rejectJoinHotelRequestController,
  approveJoinHotelRequestController,
  getAllHotelJoinRequestsController,
  getAllHotelMembersController,
  removeHotelMemberController,
  updateHotelMemberRoleController,
  getSingleHotelMemberByUserIdController,
  getHotelMemberByIdController
} from "./hotelMember.controller";

import { asyncHandler } from "../../middlewares/async-handler";
import { authenticateUser } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validator.middleware";
import {
  addHotelMemberSchema,
  updateHotelMemberRoleSchema,
  removeHotelMemberSchema,
} from "./hotelMember.validator";


router.post("/", authenticateUser, validate(addHotelMemberSchema), asyncHandler(addHotelMemberController));
router.get("/", authenticateUser, asyncHandler(getAllHotelMembersController));
router.get("/:memberId", authenticateUser, asyncHandler(getHotelMemberByIdController));
router.get("/user/:userId", authenticateUser, asyncHandler(getSingleHotelMemberByUserIdController));
router.delete("/user/:userId", authenticateUser, validate(removeHotelMemberSchema), asyncHandler(removeHotelMemberController));
router.patch("/user/:userId", authenticateUser, validate(updateHotelMemberRoleSchema), asyncHandler(updateHotelMemberRoleController));
router.post("/request", authenticateUser, asyncHandler(requestJoinHotelController));
router.get("/request", authenticateUser, asyncHandler(getAllHotelJoinRequestsController));
router.patch("/request/:requestId", authenticateUser, asyncHandler(approveJoinHotelRequestController));
router.delete("/request/:requestId", authenticateUser, asyncHandler(rejectJoinHotelRequestController));

export default router;
