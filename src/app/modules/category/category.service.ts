import { ApprovalStatus, Category, Status } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiPathError from "../../../errors/ApiPathError";
import httpStatus from "http-status";
import QueryBuilder from "../../../helpers/queryBuilder";
import ApiError from "../../../errors/ApiErrors";
import { createActionLogDB } from "../../../utils/createActionLogDB";

const createCategoryDB = async (userId: any, payload: Category) => {
  const existingName = await prisma.category.findUnique({
    where: { name: payload.name },
  });
  if (existingName) {
    throw new ApiPathError(
      httpStatus.CONFLICT,
      "name",
      "Already exists the name.",
    );
  }

  const result = await prisma.category.create({ data: payload });
  await createActionLogDB({userId,action:"CREATE",entityType:"CATEGORY",entityId:result.id})
  return result;
};
const getAllCategoriesDB = async (query: Record<string, undefined>) => {
  const queryBuilder = new QueryBuilder(prisma.category, query);
  const result = queryBuilder
    .search(["name"])
    .filter()
    .sort()
    .paginate()
    .execute();
  const meta = await queryBuilder.countTotal();
  return { data: result, meta };
};
const getSingleCategoryDB = async (id: string) => {
  const existingCategory = await prisma.category.findUnique({ where: { id } });
  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found.");
  }
  return existingCategory;
};
const updateCategoryDB = async (
  userId: string,
  categoryId: string,
  payload: Partial<Category>,
) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found.");
  }
  const result = await prisma.category.update({
    where: { id: categoryId },
    data: payload,
  });
  await createActionLogDB({userId,action:"UPDATE",entityType:"CATEGORY",entityId:result.id})
  return result;
};
const statusUpdateDB = async (
  userId: string,
  categoryId: string,
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
    result = await prisma.category.update({
      where: { id: categoryId },
      data: { status },
    });
    await createActionLogDB({userId,action:"UPDATE",entityType:"CATEGORY",entityId:result.id})
  }

  if (status === ApprovalStatus.APPROVED) {
    result = await prisma.category.update({
      where: { id: categoryId },
      data: { approvalStatus: status },
    });
    await createActionLogDB({userId,action:"APPROVED",entityType:"CATEGORY",entityId:result.id})
  }

  return result;
};

export const CategoryServices = {
  createCategoryDB,
  getAllCategoriesDB,
  getSingleCategoryDB,
  updateCategoryDB,
  statusUpdateDB
};
