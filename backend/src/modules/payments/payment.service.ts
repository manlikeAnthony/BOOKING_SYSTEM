import { prisma } from "../../config/database";
import { CustomError } from "../../errors/CustomError";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import {
  PaymentMethod,
  PaymentStatus,
  BookingStatus,
  HotelRole,
} from "@prisma/client";
import { generatePaystackReference } from "../../utils/genetatePaystackReference";
import { paystack } from "../../config/paystack";
import { getMembership } from "../../utils/getMembership";
import {
  ConfirmPaymentDTO,
  CreatePaymentDTO,
  InitializeOnlinePaymentDTO,
  VerifyPaymentDTO,
} from "../../dto/payment/payment.dto";
//helpers

const getBookingOrThrow = async (hotelId: string, bookingId: string) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      hotelId,
    },
    include: {
      guest: true,
    },
  });

  if (!booking) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.RESOURCE_NOT_FOUND,
      "Booking not found",
    );
  }

  return booking;
};

const calculateOutstanding = (booking: any) => {
  return booking.depositRequired - booking.depositPaid;
};

export const recomputeBookingPayment = async (bookingId: string, tx: any) => {
  const payments = await tx.payment.findMany({
    where: {
      bookingId: bookingId,
      status: PaymentStatus.PAID,
    },
  });

  const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.RESOURCE_NOT_FOUND,
      "Booking not found during payment recomputation",
    );
  }

  const newDepositPaid = Math.min(totalPaid, booking.depositRequired);

  const newStatus =
    newDepositPaid >= booking.depositRequired
      ? BookingStatus.CONFIRMED
      : booking.status;

  await tx.booking.update({
    where: { id: bookingId },
    data: {
      depositPaid: newDepositPaid,
      totalPaid,
      status: newStatus,
    },
  });
};

export const createPaymentService = async (
  bookingId: string,
  hotelId: string,
  data: CreatePaymentDTO,
) => {
  const booking = await getBookingOrThrow(hotelId, bookingId);

  if (booking.status === BookingStatus.CANCELLED) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_OPERATION,
      "Cannot make payment for a cancelled booking",
    );
  }
  const outstanding = calculateOutstanding(booking);

  if (data.amount > outstanding) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_OPERATION,
      `Payment amount exceeds outstanding balance of ${outstanding}`,
    );
  }

  if (data.amount <= 0) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      `Payment amount must be greater than zero`,
    );
  }

  const payment = await prisma.payment.create({
    data: {
      hotelId,
      bookingId,
      amount: data.amount,
      method: data.method,
      status: PaymentStatus.PENDING,
      notes: data.notes,

      receivedById: data.receivedById ?? null,
      initiatedById: data.initiatedById ?? null,
    },
  });

  return payment;
};

export const initializeOnlinePaymentService = async (
  bookingId: string,
  hotelId: string,
  data: InitializeOnlinePaymentDTO,
) => {
  const booking = await getBookingOrThrow(hotelId, bookingId);

  if (
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.CHECKED_OUT
  ) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_OPERATION,
      "Cannot make payment for a cancelled or checked-out booking",
    );
  }

  const outstanding = calculateOutstanding(booking);

  if (data.amount > outstanding) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_OPERATION,
      `Payment amount exceeds outstanding balance of ${outstanding}`,
    );
  }
  if (data.amount <= 0) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      `Payment amount must be greater than zero`,
    );
  }

  if (!booking.guest.email) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Guest email is required for online payments",
    );
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      idempotencyKey: data.idempotencyKey,
      bookingId,
      hotelId
    }
  })
  if (existingPayment?.providerReference) {
    return {
      payment: existingPayment,
      authorizationUrl: null,
      accessCode: null,
      reference: existingPayment.providerReference,
    };
  }

  if(existingPayment && !existingPayment.providerReference){
  const response = await paystack.post("/transaction/initialize", {
    email: booking.guest.email,
    amount: data.amount * 100,
    reference: existingPayment.reference,
    metadata: {
      bookingId,
      paymentId: existingPayment.id,
    },
  });

  await prisma.payment.update({
    where: { id: existingPayment.id },
    data: {
      providerReference: existingPayment.reference,
    },
  });

  return {
    payment: existingPayment,
    authorizationUrl: response.data.data.authorization_url,
    accessCode: response.data.data.access_code,
    reference: existingPayment.reference,
  };
  }

  const reference = generatePaystackReference();

  const payment = await prisma.payment.create({
    data: {
      hotelId,
      bookingId,
      amount: data.amount,
      method: PaymentMethod.ONLINE,
      status: PaymentStatus.PENDING,
      notes: "Online payment initialization",
      reference,
      provider: "PAYSTACK",
      providerReference: reference,
      idempotencyKey: data.idempotencyKey,
    },
  });

  const response = await paystack.post("/transaction/initialize", {
    email: booking.guest.email,
    amount: data.amount * 100, // Paystack expects amount in kobo
    reference,
    metadata: {
      bookingId,
      paymentId: payment.id,
    },
    callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
  });

  return {
    payment,
    authorizationUrl: response.data.data.authorization_url,
    accessCode: response.data.data.access_code,
    reference,
  };
};

export const verifyOnlinePaymentService = async (data: VerifyPaymentDTO) => {
  const payment = await prisma.payment.findFirst({
    where: {
      reference: data.reference,
    },
  });

  if (!payment) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.RESOURCE_NOT_FOUND,
      "Payment not found",
    );
  }

  if (payment.status === PaymentStatus.PAID) {
    return {
      message: "Payment already verified",
      payment,
    };
  }

  const response = await paystack.get(`/transaction/verify/${data.reference}`);

  if (response.data.data.amount !== payment.amount * 100) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_OPERATION,
      "Payment amount mismatch",
    );
  }

  if (response.data.data.status === "success") {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: {
          providerReference: data.reference,
        },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

      await recomputeBookingPayment(payment.bookingId, tx);
    });
  } else {
    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: PaymentStatus.FAILED,
        providerReference: response.data.data.reference,
      },
    });
  }

  return response.data;
};

export const confirmPaymentService = async (
  bookingId: string,
  userId: string,
  data: ConfirmPaymentDTO,
) => {
  const payment = await prisma.payment.findFirst({
    where: {
      id: data.paymentId,
      bookingId,
    },
  });

  if (!payment) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.RESOURCE_NOT_FOUND,
      "Payment not found",
    );
  }

  if (payment.method === PaymentMethod.ONLINE) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_OPERATION,
      "Online payments cannot be manually confirmed",
    );
  }
  const membership = await getMembership(payment.hotelId, userId);

  if (!membership) {
    CustomError.throwError(
      HttpCodes.UNAUTHORIZED,
      AppCodes.UNAUTHORIZED,
      "You are not a member of this hotel",
    );
  }

  const allowedRoles: HotelRole[] = [
    HotelRole.HOTEL_OWNER,
    HotelRole.MANAGER,
    HotelRole.RECEPTIONIST,
  ];

  if (!allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.UNAUTHORIZED,
      AppCodes.UNAUTHORIZED,
      "You do not have permission to confirm payments for this hotel",
    );
  }

  if (payment.status !== PaymentStatus.PENDING) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_OPERATION,
      "Only pending payments can be confirmed",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
      },
    });

    await recomputeBookingPayment(bookingId, tx);
  });

  return { message: "Payment confirmed successfully" };
};

export const getAllPaymentsService = async (
  hotelId: string,
  userId: string,
) => {
  const membership = await prisma.hotelMember.findFirst({
    where: {
      hotelId,
      userId,
    },
  });
  const allowedRoles: HotelRole[] = [
    HotelRole.HOTEL_OWNER,
    HotelRole.MANAGER,
    HotelRole.RECEPTIONIST,
  ];

  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.UNAUTHORIZED,
      AppCodes.UNAUTHORIZED,
      "You are not allowed to view payments for this hotel",
    );
  }
  const payments = await prisma.payment.findMany({
    where: {
      hotelId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
};

export const getSinglePaymentService = async (
  hotelId: string,
  paymentId: string,
  userId: string,
) => {
  const membership = await prisma.hotelMember.findFirst({
    where: {
      hotelId,
      userId,
    },
  });
  const allowedRoles: HotelRole[] = [
    HotelRole.HOTEL_OWNER,
    HotelRole.MANAGER,
    HotelRole.RECEPTIONIST,
  ];

  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.UNAUTHORIZED,
      AppCodes.UNAUTHORIZED,
      "You are not allowed to view payments for this hotel",
    );
  }
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      hotelId,
    },
  });

  if (!payment) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.RESOURCE_NOT_FOUND,
      "Payment not found",
    );
  }
  return payment;
};

export const getPaymentsForBookingService = async (
  hotelId: string,
  userId: string,
  bookingId: string,
) => {
  await getBookingOrThrow(hotelId, bookingId);
  const membership = await prisma.hotelMember.findFirst({
    where: {
      hotelId,
      userId,
    },
  });
  const allowedRoles: HotelRole[] = [
    HotelRole.HOTEL_OWNER,
    HotelRole.MANAGER,
    HotelRole.RECEPTIONIST,
  ];

  if (!membership || !allowedRoles.includes(membership.role)) {
    CustomError.throwError(
      HttpCodes.UNAUTHORIZED,
      AppCodes.UNAUTHORIZED,
      "You are not allowed to view payments for this booking",
    );
  }

  const payments = await prisma.payment.findMany({
    where: {
      bookingId,
      hotelId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
};
