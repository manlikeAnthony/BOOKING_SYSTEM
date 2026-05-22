import { Router } from "express";

import {
  registerController,
  loginController,
  logoutController,
  verifyEmailController,
  resendVerificationEmailController,
  forgotPasswordController,
  resetPasswordController,
} from "./auth.controller";

import { authenticateUser } from "../../middlewares/authenticate";

const router = Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/logout", authenticateUser, logoutController);

router.post("/verify-email", verifyEmailController);

router.post(
  "/resend-verification-email",
  resendVerificationEmailController,
);

router.post("/forgot-password", forgotPasswordController);

router.post("/reset-password", resetPasswordController);

export default router;