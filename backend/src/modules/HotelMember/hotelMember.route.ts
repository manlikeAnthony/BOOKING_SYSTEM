import express from "express";
const router = express.Router();

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

router.use()


router.post("/:id/members", authenticateUser, validate(addHotelMemberSchema), asyncHandler(addHotelMemberController));
router.get("/:id/members", authenticateUser, asyncHandler(getAllHotelMembersController));
router.get("/:id/members/:userId", authenticateUser, asyncHandler(getSingleHotelMemberController));
router.delete("/:id/members/:userId", authenticateUser, validate(removeHotelMemberSchema), asyncHandler(removeHotelMemberController));
router.put("/:id/members/:userId/role", authenticateUser, validate(updateHotelMemberRoleSchema), asyncHandler(updateHotelMemberRoleController));

export default router;
