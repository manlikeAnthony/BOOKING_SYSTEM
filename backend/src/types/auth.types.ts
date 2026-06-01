export type ResendVerificationEmailResponse = {
  name: string;
  email: string;
  verificationToken: string;
} | undefined;

export type ForgotPasswordResponse = {
  name: string;
  email: string;
  passwordToken: string;
} | undefined;

export type ResetPasswordPayload = {
  email: string;
  token: string;
  password: string;
};

export type Params = {
    id: string,
    userId: string,
};