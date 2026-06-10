import { PaymentMethod } from "@prisma/client";

export interface CreatePaymentDTO {
  amount: number;
  method: Exclude<PaymentMethod , "ONLINE">;
  notes?: string;
  receivedById?: string;
  initiatedById?: string;
}

export interface InitializeOnlinePaymentDTO {
  amount: number;
  idempotencyKey: string;
}

export interface VerifyPaymentDTO {
  reference: string;
}

export interface ConfirmPaymentDTO {
  paymentId: string;
}
