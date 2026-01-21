import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { RoomServices } from "./Room.service";


const createRoom = catchAsync(async (req, res) => {
  const result = await RoomServices.createRoomDB(req.user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Room created successfully.",
    data: result,
  });
});

const getAllRooms = catchAsync(async (req, res) => {
  const result = await RoomServices.getAllRoomsDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rooms retrieved successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleRoom = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RoomServices.getSingleRoomDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Room retrieved successfully.",
    data: result,
  });
});

const updateRoom = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RoomServices.updateRoomDB(
    req.user.id,
    id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Room updated successfully.",
    data: result,
  });
});

const updateRoomStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  const result = await RoomServices.statusUpdateRoomDB(
    req.user.id,
    id,
    status as any
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Room status updated successfully.",
    data: result,
  });
});

export const RoomController = {
  createRoom,
  getAllRooms,
  getSingleRoom,
  updateRoom,
  updateRoomStatus,
};
