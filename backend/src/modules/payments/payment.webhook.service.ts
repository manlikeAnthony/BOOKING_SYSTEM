import { recomputeBookingPayment } from "./payment.service";
import { prisma } from "../../config/database";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import { CustomError } from "../../errors/CustomError";
import {PaymentStatus} from "@prisma/client";

export interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
  };
}
export const handlePaymentWebhookService = async (
  event: PaystackWebhookEvent,
) => {
  if (event.event !== "charge.success") {
    return;
  }

  const reference = event.data.reference;

  const payment = await prisma.payment.findUnique({
    where: {
      providerReference: reference,
    },
  });

  if (!payment) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.PAYMENT_NOT_FOUND,
      "Payment not found for the provided reference",
    );
  }

    if(payment.status === "PAID"){
      return;
    }

  await prisma.$transaction(async (tx) => {
    await tx.payment.updateMany({
      where: {
        providerReference: reference,
        status: {not: PaymentStatus.PAID},
      },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
      },
    });

    await recomputeBookingPayment(payment.bookingId, tx);
  });
};
