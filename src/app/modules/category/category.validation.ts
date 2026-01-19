import { z } from "zod";

const createSchema = z.object({
  body: z.object({
    name: z.string().trim().nonempty("Name is required."),
  }),
});

const updateSchema = z.object({
  body: z.object({
    name: z.string().trim().optional(),
  }),
});;

export const CategoryValidation = {
  createSchema,
  updateSchema,
};
