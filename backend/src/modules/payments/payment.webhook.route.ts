import express from "express";
import {handlePaymentWebhook} from "./payment.webhook";

import {asyncHandler} from "../../middlewares/async-handler";

const router = express.Router();

router.post(
  "/",
  asyncHandler(handlePaymentWebhook),
);

export default router;