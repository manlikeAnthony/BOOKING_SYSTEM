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
import {asyncHandler} from "../../middlewares/async-handler";
const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(registerController));

router.post("/login", validate(loginSchema), asyncHandler(loginController));

router.post("/logout", authenticateUser, asyncHandler(logoutController));

router.post("/verify-email", validate(verifyEmailSchema), asyncHandler(verifyEmailController));

router.post(
  "/resend-verification-email",
  validate(resendVerificationEmailSchema),
  asyncHandler(resendVerificationEmailController),
);

router.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(forgotPasswordController));

router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(resetPasswordController));

export default router;