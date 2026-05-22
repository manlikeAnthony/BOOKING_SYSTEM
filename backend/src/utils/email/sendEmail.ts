// utils/email/sendEmail.ts

import { transporter } from "./transporter";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: `"Anthony" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};