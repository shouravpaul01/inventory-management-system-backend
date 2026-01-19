import express from "express";
import { SubCategoryController } from "./subCategory.controller";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { SubCategoryValidation } from "./subCategory.validation";
import { UserRole } from "@prisma/client";




const router = express.Router();

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN,UserRole.ADMIN),
  validateRequest(SubCategoryValidation.createSchema),
  SubCategoryController.createSubCategory
);

router.get("/", auth(), SubCategoryController.getAllSubCategories);
router.get("/:id", auth(), SubCategoryController.getSingleSubCategory);

router.patch(
  "/:id",
    auth(UserRole.SUPER_ADMIN,UserRole.ADMIN),
  validateRequest(SubCategoryValidation.updateSchema),
  SubCategoryController.updateSubCategory
);

router.patch(
  "/:id/status",
  auth(UserRole.SUPER_ADMIN,UserRole.ADMIN),
  SubCategoryController.updateSubCategoryStatus
);

export const SubCategoriesRoute= router;
