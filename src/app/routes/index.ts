import express from "express";

import { AuthRoutes } from "../modules/Auth/auth.routes";
import { UserRoutes } from "../modules/User/user.route";

import { CategoryRoute } from "../modules/Category/category.route";
import { SubCategoriesRoute } from "../modules/SubCategory/subCategory.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },

  {
    path: "/categories",
    route: CategoryRoute,
  },
   {
    path: "/sub-categories",
    route: SubCategoriesRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
