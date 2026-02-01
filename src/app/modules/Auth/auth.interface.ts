export type TResetPasswordEmailParams = {
  resetLink: string;
  expiryMinutes: number;
  appName?: string;
  supportEmail?: string;
};

export type TOtpEmailParams = {
  otp: string;
  expiryMinutes: number;
  appName?: string;
  supportEmail?: string;
};