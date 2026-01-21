import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiPathError from "../../../errors/ApiPathError";
import { ApprovalStatus, Room, Status } from "@prisma/client";
import { createActionLogDB } from "../../../utils/createActionLogDB";
import QueryBuilder from "../../../helpers/queryBuilder";
import ApiError from "../../../errors/ApiErrors";

const createRoomDB = async (userId: string, payload: Room) => {
  const existingRoom = await prisma.room.findUnique({
    where: { roomNo: payload.roomNo },
  });

  if (existingRoom) {
    throw new ApiPathError(
      httpStatus.CONFLICT,
      "roomNo",
      "Room number already exists."
    );
  }

  const result = await prisma.room.create({
    data: payload,
  });

  await createActionLogDB({
    userId,
    action: "CREATE",
    entityType: "ROOM",
    entityId: result.id,
  });

  return result;
};

const getAllRoomsDB = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.room, query);

  const data = await queryBuilder
    .search(["floor", "type"])
    .filter()
    .sort()
    .paginate()
    .execute();

  const meta = await queryBuilder.countTotal();

  return { data, meta };
};

const getSingleRoomDB = async (id: string) => {
  const result = await prisma.room.findUnique({
    where: { id },
  });

  if (!result) {
    throw new ApiPathError(
      httpStatus.NOT_FOUND,
      "id",
      "Room not found."
    );
  }

  return result;
};

const updateRoomDB = async (
  userId: string,
  id: string,
  payload: Partial<Room>
) => {
  const existingRoom = await prisma.room.findUnique({
    where: { id },
  });

  if (!existingRoom) {
    throw new ApiPathError(
      httpStatus.NOT_FOUND,
      "id",
      "Room not found."
    );
  }

  const result = await prisma.room.update({
    where: { id },
    data: payload,
  });

  await createActionLogDB({
    userId,
    action: "UPDATE",
    entityType: "ROOM",
    entityId: id,
  });

  return result;
};
const statusUpdateRoomDB = async (
  userId: string,
  roomId: string,
  status: Status | ApprovalStatus
) => {
  const allowedStatuses = [
    Status.ACTIVE,
    Status.INACTIVE,
    ApprovalStatus.APPROVED,
  ];

  if (!allowedStatuses.includes(status as Status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid status.");
  }

  let result;

  // Status update (ACTIVE / INACTIVE)
  if (status === Status.ACTIVE || status === Status.INACTIVE) {
    result = await prisma.room.update({
      where: { id: roomId },
      data: { status },
    });

    await createActionLogDB({
      userId,
      action: "UPDATE",
      entityType: "ROOM",
      entityId: result.id,
    });
  }

  // Approval update (APPROVED)
  if (status === ApprovalStatus.APPROVED) {
    result = await prisma.room.update({
      where: { id: roomId },
      data: { approvalStatus: status },
    });

    await createActionLogDB({
      userId,
      action: "APPROVED",
      entityType: "ROOM",
      entityId: result.id,
    });
  }

  return result;
};
export const RoomServices = {
  createRoomDB,
  getAllRoomsDB,
  getSingleRoomDB,
  updateRoomDB,
  statusUpdateRoomDB
};
