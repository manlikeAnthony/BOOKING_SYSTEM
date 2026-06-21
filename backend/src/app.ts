import express, { Request, Response } from "express";
// packages
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import xss from "xss-clean";
import rateLimiter from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import {RedisStore} from "rate-limit-redis";

import { notFound } from "./middlewares/not-found";
import { errorHandlerMiddleware } from "./middlewares/error-handler";


// Routes
import AuthRouter from "./modules/auth/auth.route";
import HotelRouter from "./modules/Hotel/hotel.route";
import RoomRouter from "./modules/rooms/room.route";
import HotelMemberRouter from "./modules/HotelMember/hotelMember.route"
import GuestRouter from "./modules/Guest/guest.route";
import BookingRouter from "./modules/bookings/booking.route";
import PaymentRouter from "./modules/payments/payment.route";
import PaymentWebhookRouter from "./modules/payments/payment.webhook.route";
import AnalyticsRouter from "./modules/analytics/analytics.route";

const app = express();
app.disable("x-powered-by");

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(
  "/api/v1/payments/webhook",
  express.raw({
    type: "application/json",
  }),
  PaymentWebhookRouter,
);

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);

app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
app.use(cookieParser());

app.use(morgan("dev"));

// Health Check
app.get("/api/v1", (_req: Request, res: Response) => {
  res.send("Hotel Booking API");
});

// Routes
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/hotels", HotelRouter);
app.use("/api/v1/rooms", RoomRouter);
app.use("/api/v1/members", HotelMemberRouter);
app.use("/api/v1/guests", GuestRouter);
app.use("/api/v1/bookings", BookingRouter);
app.use("/api/v1/payments", PaymentRouter);
app.use("/api/v1/analytics", AnalyticsRouter);

// not found route
app.use(notFound);

// Error Handler
app.use(errorHandlerMiddleware);

export default app;