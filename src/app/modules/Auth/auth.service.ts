import { CodeSequenceType, User, UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import emailSender from "../../../helpers/emailSender";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import prisma from "../../../shared/prisma";
import { AuthUtils } from "./auth.utils";

import { generateOtp } from "../../../utils/generateOtp";
import ApiPathError from "../../../errors/ApiPathError";
import { createActionLogDB } from "../../../utils/createActionLogDB";
const registerUser = async (userId:string,payload: User & { password: string }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existingUser) {
    throw new ApiPathError(
      httpStatus.CONFLICT,
      "email",
      "The email already exists.",
    );
  }
  const hashedPassword = await bcrypt.hash(payload.password, 12);
  const codeSequence = await prisma.codeSequence.findFirst({
    where: { type: CodeSequenceType.REGISTRATION },
  });
  if (!codeSequence) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Registration code sequence is not found.",
    );
  }
  const registrationId = `${codeSequence.prefix}${new Date().getFullYear()}${codeSequence.nextNumber}`;
  const result = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      registrationId: registrationId,
      credential: { create: { password: hashedPassword } },
    },
  });
  await createActionLogDB({userId,action:"CREATE",entityType:"USER",entityId:result.id})
  const {subject,html}= await AuthUtils.accountCreatedEmailTemplate({userId:result.registrationId,password:payload.password})
  await emailSender(subject,result.email,html)
  return result
};
const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<{
  data?: User;
  accessToken?: string;
  refreshToken?: string;
  message: string;
}> => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
      isDeleted: false,
    },
    include: { credential: true },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (existingUser.status === UserStatus.BLOCKED) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your account is blocked.");
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload?.password,
    existingUser?.credential?.password as string,
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.FORBIDDEN, "Password incorrect!");
  }
  if (!existingUser.isEmailVerified) {
    const { otp, expiresAt } = generateOtp(
      Number(config.jwt.otp_expiry_minutes),
    );
    const updateUserCredentials = await prisma.userCredential.update({
      where: { userId: existingUser.id },
      data: { otp, otpExpireAt: expiresAt },
    });
    if (!updateUserCredentials || !updateUserCredentials.otp) {
      throw new Error("OTP not found");
    }
    const { subject, html } = AuthUtils.otpEmailTemplate({
      otp: updateUserCredentials?.otp,
      expiryMinutes: Number(config.jwt.otp_expiry_minutes),
    });
    await emailSender(subject, existingUser.email, html);
    return {
      data: existingUser,
      message: "OTP has been sent. Check your email to verify your account.",
    };
  }
  const accessToken = jwtHelpers.generateToken(
    {
      id: existingUser.id,
      firstName: existingUser.name,

      email: existingUser.email,
      role: existingUser.role,
      photo: existingUser.photo || null,
    },
    config.jwt.jwt_secret as Secret,
    (config.jwt.expires_in as string) || "7d",
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: existingUser.id,
      firstName: existingUser.name,

      email: existingUser.email,
      role: existingUser.role,
      photo: existingUser.photo || null,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string,
  );
  await prisma.userCredential.update({
    where: { userId: existingUser.id },
    data: { refreshToken },
  });
  return {
    accessToken,
    refreshToken,
    message: "User logged in successfully",
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const resetPassToken = jwtHelpers.generateToken(
    { id: existingUser.id, email: existingUser.email, role: existingUser.role },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_token_expires_in as string,
  );

  const resetPassLink = config.reset_pass_link + `?token=${resetPassToken}`;
  const { subject, html } = await AuthUtils.resetPasswordEmailTemplate({
    resetLink: resetPassLink,
    expiryMinutes: 1,
  });
  await emailSender(subject, existingUser.email, html);
  return {
    message: "Reset password link sent via your email successfully",
  };
};

// reset password
const resetPassword = async (payload: { token: string; password: string }) => {
  const isValidToken = jwtHelpers.verifyToken(
    payload.token,
    config.jwt.reset_pass_secret as Secret,
  );

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }
  const existingUser = await prisma.user.findUnique({
    where: {
      id: isValidToken.id,
    },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // hash password
  const password = await bcrypt.hash(payload.password, 12);

  // update into database
  await prisma.userCredential.update({
    where: {
      id: existingUser.id,
    },
    data: {
      password,
      otp: null,
      otpExpireAt: null,
    },
  });
  return { message: "Password reset successfully" };
};

// change password
const changePassword = async (
  userId: string,
  payload: { oldPassword: string; newPassword: string },
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { credential: true },
  });

  if (!existingUser || !existingUser?.credential?.password) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(
    payload?.oldPassword,
    existingUser?.credential?.password,
  );

  if (!isPasswordValid) {
    throw new ApiPathError(
      httpStatus.UNAUTHORIZED,
      "oldPassword",
      "Incorrect old password",
    );
  }

  const hashedPassword = await bcrypt.hash(payload.newPassword, 12);

  await prisma.userCredential.update({
    where: {
      userId: existingUser.id,
    },
    data: {
      password: hashedPassword,
    },
  });
  return { message: "Password changed successfully" };
};

export const AuthServices = {
  registerUser,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
