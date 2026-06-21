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
import {authRateLimiter} from "../../middlewares/rate-limit";
const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), asyncHandler(registerController));

router.post("/login", authRateLimiter, validate(loginSchema), asyncHandler(loginController));

router.post("/logout", authenticateUser, asyncHandler(logoutController));

router.post("/verify-email", authRateLimiter, validate(verifyEmailSchema), asyncHandler(verifyEmailController));

router.post(
  "/resend-verification-email",
  authRateLimiter,
  validate(resendVerificationEmailSchema),
  asyncHandler(resendVerificationEmailController),
);

router.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), asyncHandler(forgotPasswordController));

router.post("/reset-password", authRateLimiter, validate(resetPasswordSchema), asyncHandler(resetPasswordController));

export default router;