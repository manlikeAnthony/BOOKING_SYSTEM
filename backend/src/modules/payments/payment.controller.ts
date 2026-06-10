import { Request, Response } from "express";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import {
  CreatePaymentDTO,
  VerifyPaymentDTO,
  InitializeOnlinePaymentDTO,
  ConfirmPaymentDTO,
} from "../../dto/payment/payment.dto";
import { createPaymentService ,
    initializeOnlinePaymentService,
    verifyOnlinePaymentService,
    confirmPaymentService,
    getAllPaymentsService,
    getSinglePaymentService,
    getPaymentsForBookingService
} from "./payment.service";
import { HotelParams } from "../../types/params.types";
import {successResponse} from "../../response";

export const createPayment = async (req: Request<HotelParams>, res: Response) => {
  const bookingId = req.params.bookingId;
        const hotelId = req.params.hotelId;
  const { amount, method, notes, receivedById, initiatedById } = req.body;

  const data: CreatePaymentDTO = {
    amount,
    method,
    notes,
    receivedById,
    initiatedById,
  };

  const payment = await createPaymentService(bookingId, hotelId, data);

  res.status(HttpCodes.CREATED).json(successResponse({
    code: AppCodes.PAYMENT_CREATED,
    message: "Payment created successfully",
    data: payment,
  }));
}


export const initializeOnlinePayment = async (req: Request<HotelParams>, res: Response) => {
  const bookingId = req.params.bookingId;
  const hotelId = req.params.hotelId;
  const { amount , idempotencyKey } = req.body;

  const data: InitializeOnlinePaymentDTO = {
    amount,
    idempotencyKey,
  };

  const paymentInitialization = await initializeOnlinePaymentService(bookingId, hotelId, data);

  res.status(HttpCodes.OK).json(successResponse({
    code: AppCodes.ONLINE_PAYMENT_INITIALIZED,
    message: "Online payment initialized successfully",
    data: paymentInitialization,
  }));
};

export const verifyOnlinePayment = async (req: Request<HotelParams>, res: Response) => {
  const { reference } = req.body;

  const data: VerifyPaymentDTO = {
    reference,
  };

  const verificationResult = await verifyOnlinePaymentService(data);

  res.status(HttpCodes.OK).json(successResponse({
    code: AppCodes.ONLINE_PAYMENT_VERIFIED,
    message: "Online payment verified successfully",
    data: verificationResult,
  }));
}


export const confirmPayment = async (req: Request<HotelParams>, res: Response) => {
  const bookingId = req.params.bookingId;
    const  userId = req.user.userId;
  const { paymentId } = req.body;

  const data: ConfirmPaymentDTO = {
    paymentId,
  };

  const confirmationResult = await confirmPaymentService(bookingId, userId, data);

  res.status(HttpCodes.OK).json(successResponse({
    code: AppCodes.PAYMENT_CONFIRMED,
    message: "Payment confirmed successfully",
    data: confirmationResult,
  }));
}

export const getAllPayments = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
    const userId = req.user.userId;

  const payments = await getAllPaymentsService(hotelId, userId);
  
  res.status(HttpCodes.OK).json(successResponse({
    code: AppCodes.SUCCESS,
    message: "Payments retrieved successfully",
    data: payments,
  }));
}

export const getSinglePayment = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const paymentId = req.params.paymentId;
  const userId = req.user.userId;

  const payment = await getSinglePaymentService(hotelId, paymentId , userId);
  
  res.status(HttpCodes.OK).json(successResponse({
    code: AppCodes.SUCCESS,
    message: "Payment retrieved successfully",
    data: payment,
  }));
}

export const getPaymentsForBooking = async (req: Request<HotelParams>, res: Response) => {
  const hotelId = req.params.hotelId;
  const userId = req.user.userId;
  const bookingId = req.params.bookingId;

  const payments = await getPaymentsForBookingService(hotelId, userId, bookingId);
  
  res.status(HttpCodes.OK).json(successResponse({
    code: AppCodes.SUCCESS,
    message: "Payments for booking retrieved successfully",
    data: payments,
  }));
};

