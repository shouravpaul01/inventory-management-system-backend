import { z } from "zod";
import { Status, ApprovalStatus } from "@prisma/client";

const createRoomSchema = z.object({
  body: z.object({
    floor: z.string().trim().nonempty("Floor is required."),
    roomNo: z.number().int("Room number must be an integer."),
    type: z.string().trim().nonempty("Room type is required."),
    images: z.array(z.string()).optional(),
    description: z.string().optional(),
    specifications: z.string().optional(),
  }),
});

const updateRoomSchema = z.object({
  body: z.object({
    floor: z.string().optional(),
    roomNo: z.number().int().optional(),
    type: z.string().optional(),
    images: z.array(z.string()).optional(),
    description: z.string().optional(),
    specifications: z.string().optional(),
    status: z.nativeEnum(Status).optional(),
    approvalStatus: z.nativeEnum(ApprovalStatus).optional(),
  }),
});



export const RoomValidation = {
  createRoomSchema,
  updateRoomSchema,
 
};
