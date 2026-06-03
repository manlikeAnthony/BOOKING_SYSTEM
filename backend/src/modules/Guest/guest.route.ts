import express from "express";
const router = express.Router();

import {
  createGuestController,
  getAllGuestsController,
  getGuestByIdController,
  updateGuestController,
  deleteGuestController,
} from "./guest.controller";

import { asyncHandler } from "../../middlewares/async-handler";
import { authenticateUser } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validator.middleware";
import { createGuestSchema, updateGuestSchema } from "./guest.validator";

router.post("/", authenticateUser, validate(createGuestSchema), asyncHandler(createGuestController));
router.get("/", authenticateUser, asyncHandler(getAllGuestsController));
router.get("/:guestId", authenticateUser, asyncHandler(getGuestByIdController));
router.put("/:guestId", authenticateUser, validate(updateGuestSchema), asyncHandler(updateGuestController));
router.delete("/:guestId", authenticateUser, asyncHandler(deleteGuestController));

export default router;