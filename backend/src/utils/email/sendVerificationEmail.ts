import { sendEmail } from "../../utils/email/sendEmail";
import { VerificationEmailParams } from "../../types/email";

export const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}: VerificationEmailParams): Promise<void> => {
  const verifyUrl = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;

  const html = `
    <h4>Hello, ${name}</h4>
    <p>Please confirm your email by copying the following ${verificationToken} and clicking the link below:</p>
    <a href="${verifyUrl}">Verify Email</a>
  `;

  await sendEmail({
    to: email,
    subject: "Email Confirmation",
    html,
  });
};