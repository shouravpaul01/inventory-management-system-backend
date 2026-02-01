type OtpResponse = {
  otp: string;
  expiresAt: Date;
};

export const generateOtp=(expireInMinutes = 5): OtpResponse=>{
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expireInMinutes);

  return {
    otp,
    expiresAt,
  };
}
