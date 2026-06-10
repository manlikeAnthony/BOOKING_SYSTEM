import express from "express";
const router = express.Router({mergeParams: true});

import {
  addHotelMemberController,
  getAllHotelMembersController,
  removeHotelMemberController,
  updateHotelMemberRoleController,
  getSingleHotelMemberController,
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
router.get("/:userId", authenticateUser, asyncHandler(getSingleHotelMemberController));
router.delete("/:userId", authenticateUser, validate(removeHotelMemberSchema), asyncHandler(removeHotelMemberController));
router.put("/:userId/role", authenticateUser, validate(updateHotelMemberRoleSchema), asyncHandler(updateHotelMemberRoleController));

export default router;
