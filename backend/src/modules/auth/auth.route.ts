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
import { validate } from "../../middlewares/validator.middleware";
import {registerSchema , loginSchema , verifyEmailSchema , resendVerificationEmailSchema , forgotPasswordSchema , resetPasswordSchema} from "./auth.validation";
const router = Router();

router.post("/register", validate(registerSchema), registerController);

router.post("/login", validate(loginSchema), loginController);

router.post("/logout", authenticateUser, logoutController);

router.post("/verify-email", validate(verifyEmailSchema), verifyEmailController);

router.post(
  "/resend-verification-email",
  validate(resendVerificationEmailSchema),
  resendVerificationEmailController,
);

router.post("/forgot-password", validate(forgotPasswordSchema), forgotPasswordController);

router.post("/reset-password", validate(resetPasswordSchema), resetPasswordController);

export default router;