import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AuthControllers } from "./auth.controller";
import { AuthValidations } from "./auth.validation";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/register",
   auth(UserRole.SUPER_ADMIN,UserRole.ADMIN),
  validateRequest(AuthValidations.registerSchema),
  AuthControllers.registerUser
);

// user login route
router.post(
  "/login",
  validateRequest(AuthValidations.loginValidationSchema),
  AuthControllers.loginUser
);

router.post(
  "/change-password",
  validateRequest(AuthValidations.changePasswordValidationSchema),
  auth(),
  AuthControllers.changePassword
);

router.post(
  "/forgot-password",
  validateRequest(AuthValidations.forgotPasswordSchema),
  AuthControllers.forgotPassword
);

router.post(
  "/reset-password",
  validateRequest(AuthValidations.resetPasswordSChema),
  AuthControllers.resetPassword
);

export const AuthRoutes = router;
