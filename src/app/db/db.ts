import bcrypt from "bcrypt";
import prisma from "../../shared/prisma";
import { User, UserRole, UserStatus } from "@prisma/client";

export const initiateSuperAdmin = async () => {
  const payload = {
    name: "Super admin" as string,
    email: "superadmin@gmail.com" as string,
    phone: "1234567890" as string,
    role: UserRole.SUPER_ADMIN,
    isEmailVerified: true,
  };
  const hashPassword = (await bcrypt.hash("12345678", 10)) as string;
  const existAdmin = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existAdmin) {
    return;
  }

  await prisma.user.create({
    data: { ...payload, credential: { create: { password: hashPassword } } },
  });
};
