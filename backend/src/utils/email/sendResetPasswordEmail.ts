// services/email/sendResetPasswordEmail.ts

import { sendEmail } from "../../utils/email/sendEmail";
import { ResetPasswordEmailParams } from "../../types/email";

export const sendResetPasswordEmail = async ({
  name,
  email,
  token,
  origin,
}: ResetPasswordEmailParams): Promise<void> => {
  const resetUrl = `${origin}/user/reset-password?token=${token}&email=${email}`;

  const html = `
    <h4>Hello, ${name}</h4>
    <p>Please reset your password using the link below:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>Or use this token: <strong>${token}</strong></p>
  `;

  await sendEmail({
    to: email,
    subject: "Reset Password",
    html,
  });
};