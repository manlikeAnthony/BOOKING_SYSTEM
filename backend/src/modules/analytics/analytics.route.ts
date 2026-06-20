import express from "express";
import {
    getRevenueAnalyticsController,
    getBookingStatsController,
    getOccupancyRateController,
} from "./analytics.controller";
import { asyncHandler } from "../../middlewares/async-handler";
import { authenticateUser } from "../../middlewares/authenticate";

const router = express.Router({ mergeParams: true });

router.get(
    "/revenue",
    authenticateUser,
    asyncHandler(getRevenueAnalyticsController),
);

router.get(
    "/bookings",
    authenticateUser,
    asyncHandler(getBookingStatsController),
);

router.get(
    "/occupancy",
    authenticateUser,
    asyncHandler(getOccupancyRateController),
);

export default router;