import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { RoomValidation } from "./Room.validation";
import { UserRole } from "@prisma/client";
import { RoomController } from "./Room.controller";




const router = express.Router();

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(RoomValidation.createRoomSchema),
  RoomController.createRoom
);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN,UserRole.TEACHER, UserRole.STAFF),
  RoomController.getAllRooms
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN,UserRole.TEACHER, UserRole.STAFF),
  RoomController.getSingleRoom
);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(RoomValidation.updateRoomSchema),
  RoomController.updateRoom
);

router.patch(
  "/:id/status",
  auth(UserRole.SUPER_ADMIN,UserRole.SUPER_ADMIN),
  RoomController.updateRoomStatus
);

export const RoomRoutes= router;
