import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { notFound } from "./middlewares/not-found";
import { errorHandlerMiddleware } from "./middlewares/error-handler";

// Routes
import authRouter from "./modules/auth/auth.route";
import hotelRouter from "./modules/Hotel/hotel.route";
import RoomRouter from "./modules/rooms/room.route";
import HotelMemberRouter from "./modules/HotelMember/hotelMember.route"
import GuestRouter from "./modules/Guest/guest.route";
import BookingRouter from "./modules/bookings/booking.route";

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Health Check
app.get("/api/v1", (_req: Request, res: Response) => {
  res.send("Hotel Booking API");
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/hotels", hotelRouter);
app.use("/api/v1/rooms", RoomRouter);
app.use("/api/v1/hotel-members", HotelMemberRouter);
app.use("/api/v1/guests", GuestRouter);
app.use("/api/v1/bookings", BookingRouter);

// not found route
app.use(notFound);

// Error Handler
app.use(errorHandlerMiddleware);

export default app;