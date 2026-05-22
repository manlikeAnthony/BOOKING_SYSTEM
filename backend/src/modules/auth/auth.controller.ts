import {Request, Response} from "express";
import {
    registerService,
    loginService,
    verifyEmailService,
    resendVerificationEmailService,
    forgotPasswordService,
    resetPasswordService,
    logoutService,
} from './auth.service';
import { attachCookiesToResponse , createTokenUser } from "../../utils";
import { successResponse } from "../../response";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import { emailQueue } from "../../queues/email.queue";

export const registerController = async (req: Request, res: Response) => {
    const { user, verificationToken } = await registerService(req.body);

    await emailQueue.add("sendVerificationEmail", {
        name: user.name,
        email: user.email,
        verificationToken,
        origin : process.env.FRONTEND_URL,
    });

    return res.status(HttpCodes.CREATED).json(
        successResponse({
            message: "User registered successfully. Please check your email to verify your account.",
            data : null,
            code: AppCodes.USER_CREATED,
        })
    );
};

export const loginController = async (req: Request, res: Response) => {
  const { tokenUser, refreshToken } = await loginService(req.body , {ip : req.ip, userAgent : req.headers["user-agent"]});

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });
  
  return res.status(HttpCodes.OK).json(
    successResponse({
      message: "Login successful",
      data: { user: tokenUser },
      code: AppCodes.AUTH_LOGIN_SUCCESS,
    })
  );
};

export const logoutController = async (req: Request, res: Response) => {
  await logoutService(req.user.userId);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(HttpCodes.OK).json(
    successResponse({
      message: "Logout successful",
      data: null,
      code: AppCodes.AUTH_LOGOUT_SUCCESS,
    })
  );
};

export const verifyEmailController = async (req: Request, res: Response) => {
  await verifyEmailService(req.body);

  return res.status(HttpCodes.OK).json(
    successResponse({
      message: "Email verified successfully",
      data: null,
      code: AppCodes.USER_VERIFIED,
    })
  );
};

export const resendVerificationEmailController = async (req: Request, res: Response) => {
  const result = await resendVerificationEmailService(req.body);

  if (!result) {
    return res.status(HttpCodes.OK).json(
      successResponse({
        message: "If an account with that email exists, a verification email has been sent",
        data: null,
        code: AppCodes.AUTH_VERIFICATION_EMAIL_SENT,
      })
    );
  }

  const { name, email, verificationToken } = result;

  await emailQueue.add("sendVerificationEmail", {
    name,
    email,
    verificationToken,
    origin : process.env.FRONTEND_URL,
  });

  return res.status(HttpCodes.OK).json(
    successResponse({
      message: "Verification email resent successfully",
      data: null,
      code: AppCodes.AUTH_VERIFICATION_EMAIL_SENT,
    })
  );
};

export const forgotPasswordController = async (req: Request, res: Response) => {
    const result = await forgotPasswordService(req.body);

    if (!result) {
      return res.status(HttpCodes.OK).json(
        successResponse({
          message: "If an account with that email exists, a password reset email has been sent",
          data: null,
          code: AppCodes.PASSWORD_RESET_ATTEMPT_NON_EXISTENT_EMAIL,
        })
      );
    }

    const { name, email, passwordToken } = result;

    await emailQueue.add("sendPasswordResetEmail", {
      name,
      email,
      token: passwordToken,
      origin : process.env.FRONTEND_URL,
    });

    return res.status(HttpCodes.OK).json(
      successResponse({
        message: "Password reset email sent successfully",
        data: null,
        code: AppCodes.AUTH_PASSWORD_RESET_SUCCESS,
      })
    );
};

export const resetPasswordController = async (req: Request, res: Response) => {
  await resetPasswordService(req.body);

  return res.status(HttpCodes.OK).json(
    successResponse({
      message: "Password reset successfully",
      data: null,
      code: AppCodes.AUTH_PASSWORD_RESET_SUCCESS,
    })
  );
};


