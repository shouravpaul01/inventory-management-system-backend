import { UserRole } from "@prisma/client";
import { z } from "zod";

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6),
  }),
});
const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});
const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});
const resetPasswordSChema = z.object({
  body: z.object({
    token: z.string(),
    userId: z.string(),
    password: z.string(),
  }),
});

const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().nonempty("The field is required."),
   
    email: z.string().nonempty("The field is required.").email({
      message: "Valid email is required.",
    }),
    phone: z.string().nonempty("The field is required.").min(5),
    
    password: z.string().nonempty("The field is required.").min(6, {
      message: "Password must be at least 8 characters long.",
    }),
  }),
});

export const AuthValidations = {
  changePasswordValidationSchema,
  loginValidationSchema,
  resetPasswordSChema,
  forgotPasswordSchema,
  registerSchema,
};
