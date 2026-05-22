import { prisma } from "../../config/database";
import bcrypt from "bcryptjs";
import { createTokenUser } from "../../utils";
import { CustomError } from "../../errors/CustomError";
import { AppCodes } from "../../errors/AppCodes";
import { HttpCodes } from "../../errors/HttpCodes";
import crypto from "crypto";
import { CustomLogger } from "../../logger/CustomLogger";

export const registerService = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const { name, email, password } = data;

  if (!name || !email || !password) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.MISSING_REQUIRED_FIELDS,
      "Name, email and password are required",
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.USER_ALREADY_EXISTS,
      "Email already in use",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const isFirstAccount = (await prisma.user.count()) === 0;

  const verificationToken = crypto.randomInt(100000, 1000000).toString();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: isFirstAccount ? "SUPER_ADMIN" : "USER",
      isVerified: false,
      verificationToken,
    },
  });

  return { user, verificationToken };
};

export const loginService = async (
  data: { email: string; password: string },
  meta: { ip?: string; userAgent?: string },
) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    CustomError.throwError(
      HttpCodes.UNAUTHORIZED,
      AppCodes.AUTH_INVALID_CREDENTIALS,
      "Invalid email or password",
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    CustomError.throwError(
      HttpCodes.UNAUTHORIZED,
      AppCodes.AUTH_INVALID_CREDENTIALS,
      "Invalid email or password",
    );
  }

  if (!user.isVerified) {
    CustomError.throwError(
      HttpCodes.FORBIDDEN,
      AppCodes.USER_INACTIVE,
      "Please verify your email before logging in",
    );
  }

  const tokenUser = createTokenUser(user);

  let refreshToken = crypto.randomBytes(40).toString("hex");

  await prisma.token.upsert({
    where: { userId: user.id },
    update: {
      refreshToken,
      ip: meta.ip,
      userAgent: meta.userAgent,
      isValid: true,
    },
    create: {
      userId: user.id,
      refreshToken,
      ip: meta.ip,
      userAgent: meta.userAgent,
      isValid: true,
    },
  });
  return { tokenUser, refreshToken };
};

export const verifyEmailService = async (data: {
  email: string;
  token: string;
}) => {
  const { email, token } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.USER_NOT_FOUND,
      "User not found",
    );
  }

  if (user.isVerified) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.USER_ALREADY_VERIFIED,
      "Email already verified",
    );
  }

  if (user.verificationToken !== token) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.INVALID_INPUT,
      "Invalid verification token",
    );
  }

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
      verificationToken: null,
    },
  });

  return updatedUser;
};

export const resendVerificationEmailService = async (data: {
  email: string;
}) => {
  const { email } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    CustomLogger.info(
      "resendVerificationEmailService",
      AppCodes.RESEND_VERIFICATION_EMAIL_NON_EXISTENT_EMAIL,
      {
        message: `Resend verification email attempt for non-existent email: ${email}`,
      },
    );
    return undefined;
  }

  if (user.isVerified) {
    CustomLogger.info(
      "resendVerificationEmailService",
      AppCodes.USER_ALREADY_VERIFIED,
      { message: `Resend verification email attempt for already verified email: ${email}` },
    );
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.USER_ALREADY_VERIFIED,
      "Email already verified",
    );
  }

  const verificationToken = crypto.randomInt(100000, 1000000).toString();

  await prisma.user.update({
    where: { email },
    data: {
      verificationToken,
    },
  });

  return {
    name: user.name,
    email: user.email,
    verificationToken,
  };
};

export const forgotPasswordService = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    CustomLogger.info(
      "forgotPasswordService",
      AppCodes.PASSWORD_RESET_ATTEMPT_NON_EXISTENT_EMAIL,
      { message: `Password reset attempt for non-existent email1: ${email}` },
    );
    return undefined;
  }

  const passwordToken = crypto.randomBytes(20).toString("hex");
  user.passwordTokenExpirationDate = new Date(Date.now() + 3600000); // 1 hour

  const hashedPasswordToken = await bcrypt.hash(passwordToken, 10);

  await prisma.user.update({
    where: { email },
    data: {
      passwordToken: hashedPasswordToken,
      passwordTokenExpirationDate: user.passwordTokenExpirationDate,
    },
  });
  
  return {
    name: user.name,
    email: user.email,
    passwordToken,
  };
};

export const resetPasswordService = async (data: {
    email: string;
    token: string;
    password: string;
    }) => {
    const { email, token, password } = data;

    const user = await prisma.user.findUnique({
    where: { email },
    });

    if (!user) {
    CustomLogger.info(
        "resetPasswordService",
        AppCodes.PASSWORD_RESET_ATTEMPT_NON_EXISTENT_EMAIL,
        { message: `Password reset attempt for non-existent email2: ${email}` },
    );
    CustomError.throwError(
        HttpCodes.NOT_FOUND,
        AppCodes.USER_NOT_FOUND,
        "User not found",
    );
    }

    if (user.passwordToken !== token || !user.passwordTokenExpirationDate || user.passwordTokenExpirationDate < new Date()) {
    CustomLogger.info(
        "resetPasswordService",
        AppCodes.PASSWORD_RESET_ATTEMPT_INVALID_TOKEN,
        { message: `Password reset attempt with invalid or expired token for email: ${email}` },
    );
    CustomError.throwError(
        HttpCodes.BAD_REQUEST,
        AppCodes.PASSWORD_RESET_ATTEMPT_INVALID_TOKEN,
        "Invalid or expired password reset token",
    );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
    where: { email },
    data: {
        password: hashedPassword,
        passwordToken: null,
        passwordTokenExpirationDate: null,
    },
    });

    return {
    name: user.name,
    email: user.email,
    };
};

export const logoutService = async (userId: string) => {
  await prisma.token.updateMany({
    where: { userId },
    data: { isValid: false },
  });
}; 
