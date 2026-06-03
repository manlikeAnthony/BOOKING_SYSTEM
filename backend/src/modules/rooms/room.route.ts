import express from "express";
import {
  createRoom,
  getAllRooms,
  getSingleRoom,
  updateRoom,
  deleteRoom,
  deactivateRoomsByHotelId,
} from "./room.controller";
import { authenticateUser } from "../../middlewares/authenticate";
import { asyncHandler } from "../../middlewares/async-handler";
import { validate } from "../../middlewares/validator.middleware";
import { createRoomSchema, updateRoomSchema } from "./room.validator";
const router = express.Router({ mergeParams: true });

router.post("/", authenticateUser, validate(createRoomSchema), asyncHandler(createRoom));
router.get("/", authenticateUser, asyncHandler(getAllRooms));
router.get("/:roomId", authenticateUser, asyncHandler(getSingleRoom));
router.put("/:roomId", authenticateUser, validate(updateRoomSchema), asyncHandler(updateRoom));
router.delete("/:roomId", authenticateUser, asyncHandler(deleteRoom));
router.post("/deactivate", authenticateUser, asyncHandler(deactivateRoomsByHotelId));

export default router;