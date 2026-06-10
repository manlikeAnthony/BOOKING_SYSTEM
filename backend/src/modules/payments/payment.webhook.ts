import { Request, Response } from "express";
import { handlePaymentWebhookService } from "./payment.webhook.service";
import crypto from "crypto";

export const handlePaymentWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers["x-paystack-signature"] as string;

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
      .update(req.body)
      .digest("hex");

    if (hash !== signature) {
       res.status(401).send("Unauthorized: Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    await handlePaymentWebhookService(event);
    
     res.status(200).send("Webhook handled successfully");
  } catch (error) {
    console.error("Error handling payment webhook:", error);
     res.status(500).send("Internal Server Error");
  }
};
