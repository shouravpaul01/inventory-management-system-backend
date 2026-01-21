import { SubCategory, Status, ApprovalStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { createActionLogDB } from "../../../utils/createActionLogDB";
import QueryBuilder from "../../../helpers/queryBuilder";

const createSubCategoryDB = async (userId: string, payload: SubCategory) => {
  const existingName = await prisma.subCategory.findUnique({
    where: { name: payload.name },
  });
  if (existingName) {
    throw new ApiError(httpStatus.CONFLICT, "Name already exists.");
  }

  const result = await prisma.subCategory.create({ data: payload });
  await createActionLogDB({
    userId,
    action: "CREATE",
    entityType: "SUBCATEGORY",
    entityId: result.id,
  });
  return result;
};

const getAllSubCategoriesDB = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.subCategory, query);
  const result = queryBuilder
    .search(["name"])
    .filter()
    .sort()
    .include({ category: true })
    .paginate()
    .execute();
  const meta = await queryBuilder.countTotal();
  return { data: result, meta };
};

const getSingleSubCategoryDB = async (id: string) => {
  const existing = await prisma.subCategory.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "SubCategory not found.");
  }
  return existing;
};

const updateSubCategoryDB = async (
  userId: string,
  subCategoryId: string,
  payload: Partial<SubCategory>,
) => {
  const existing = await prisma.subCategory.findUnique({
    where: { id: subCategoryId },
  });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "SubCategory not found.");
  }

  const result = await prisma.subCategory.update({
    where: { id: subCategoryId },
    data: payload,
  });

  await createActionLogDB({
    userId,
    action: "UPDATE",
    entityType: "SUBCATEGORY",
    entityId: result.id,
  });

  return result;
};

const statusUpdateDB = async (
  userId: string,
  subCategoryId: string,
  status: Status | ApprovalStatus,
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

  if (status === Status.ACTIVE || status === Status.INACTIVE) {
    result = await prisma.subCategory.update({
      where: { id: subCategoryId },
      data: { status },
    });
    await createActionLogDB({
      userId,
      action: "UPDATE",
      entityType: "SUBCATEGORY",
      entityId: result.id,
    });
  }

  if (status === ApprovalStatus.APPROVED) {
    result = await prisma.subCategory.update({
      where: { id: subCategoryId },
      data: { approvalStatus: status },
    });
    await createActionLogDB({
      userId,
      action: "APPROVED",
      entityType: "SUBCATEGORY",
      entityId: result.id,
    });
  }

  return result;
};

export const SubCategoryServices = {
  createSubCategoryDB,
  getAllSubCategoriesDB,
  getSingleSubCategoryDB,
  updateSubCategoryDB,
  statusUpdateDB,
  
};
