import { Category } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiPathError from "../../../errors/ApiPathError";
import httpStatus from "http-status";
import QueryBuilder from "../../../helpers/queryBuilder";
import ApiError from "../../../errors/ApiErrors";

const createCategoryDB = async (user: any, payload: Category) => {
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
  user: any,
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
  return result;
};
export const CategoryServices = {
  createCategoryDB,
  getAllCategoriesDB,
  getSingleCategoryDB,
  updateCategoryDB
};
