import express from "express";
const router = express.Router();

import  {
    createHotelController,
    getAllHotelsController,
    getHotelByIdController,
    deleteHotelController,
    updateHotelController
} from "./hotel.controller";
import { asyncHandler } from "../../middlewares/async-handler";
import { authenticateUser } from "../../middlewares/authenticate";
import {validate}  from "../../middlewares/validator.middleware";
import { createHotelSchema , updateHotelSchema } from "./hotel.validator";

router.post("/", authenticateUser , validate(createHotelSchema) , createHotelController);
router.get("/", asyncHandler(getAllHotelsController));
router.get("/:id", asyncHandler(getHotelByIdController));
router.delete("/:id", authenticateUser , asyncHandler(deleteHotelController));
router.put("/:id", authenticateUser , validate(updateHotelSchema) , asyncHandler(updateHotelController));

export default router;