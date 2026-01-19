import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { SubCategoryServices } from "./subCategory.service";

const createSubCategory = catchAsync(async (req, res) => {
  const result = await SubCategoryServices.createSubCategoryDB(
    req.user.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "SubCategory created successfully.",
    data: result,
  });
});

const getAllSubCategories = catchAsync(async (req, res) => {
  const result = await SubCategoryServices.getAllSubCategoriesDB(req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "SubCategories retrieved successfully.",
    data: result,
  });
});

const getSingleSubCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SubCategoryServices.getSingleSubCategoryDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "SubCategory retrieved successfully.",
    data: result,
  });
});

const updateSubCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SubCategoryServices.updateSubCategoryDB(
    req.user.id,
    id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "SubCategory updated successfully.",
    data: result,
  });
});

const updateSubCategoryStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  const result = await SubCategoryServices.statusUpdateDB(
    req.user.id,
    id,
    status as any
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "SubCategory status updated successfully.",
    data: result,
  });
});

export const SubCategoryController = {
  createSubCategory,
  getAllSubCategories,
  getSingleSubCategory,
  updateSubCategory,
  updateSubCategoryStatus,
};
