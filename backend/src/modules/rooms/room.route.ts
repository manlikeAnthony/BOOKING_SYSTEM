import express from "express";
import {
  createRoom,
  getAllRooms,
  getSingleRoom,
  updateRoom,
  deleteRoom,
  deactivateRoomsByHotelId,
} from "./room.controller";

const router = express.Router({ mergeParams: true });

router.post("/", createRoom);
router.get("/", getAllRooms);
router.get("/:roomId", getSingleRoom);
router.put("/:roomId", updateRoom);
router.delete("/:roomId", deleteRoom);
router.post("/deactivate", deactivateRoomsByHotelId);

export default router;