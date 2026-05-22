// types/email.types.ts

export interface VerificationEmailParams {
  name: string;
  email: string;
  verificationToken: string;
  origin: string;
}

export interface ResetPasswordEmailParams {
  name: string;
  email: string;
  token: string;
  origin: string;
}

export interface VerificationEmailJob {
  name: string;
  email: string;
  verificationToken: string;
  origin: string;
}

export interface ResetPasswordJob {
  name: string;
  email: string;
  token: string;
  origin: string;
}
