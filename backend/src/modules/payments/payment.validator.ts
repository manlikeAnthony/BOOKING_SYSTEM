import Joi from "joi";
import { PaymentMethod } from "@prisma/client";

export const createPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  method: Joi.string()
    .valid(...Object.values(PaymentMethod))
    .required().messages({
      "any.only": `Method must be one of ${Object.values(PaymentMethod).join(", ")}`,
    }),
  bookingId: Joi.string().required(),
});


export const confirmPaymentSchema = Joi.object({
  paymentId: Joi.string().required(),
});

export const initializeOnlinePaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  bookingId: Joi.string().required(),
  method: Joi.string().valid(PaymentMethod.ONLINE).required().messages({
    "any.only": "Method must be ONLINE for online payments",
  }),
});

export const verifyPaymentSchema = Joi.object({
  paymentId: Joi.string().required(),
  method: Joi.string().valid(PaymentMethod.ONLINE).required().messages({
    "any.only": "Method must be ONLINE for online payments",
  }),
});