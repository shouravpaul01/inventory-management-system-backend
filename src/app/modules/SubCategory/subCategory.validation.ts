import { z } from 'zod'

const createSchema= z.object({
  body: z.object({
    name: z.string().trim().nonempty("name is required."),
    categoryId: z.string().trim().nonempty("Category is required.")
  }),
})
const updateSchema= z.object({
  body: z.object({
    name: z.string().trim().optional(),
    categoryId: z.string().trim().optional()
  }),
})
export const SubCategoryValidation = {
  createSchema,
  updateSchema
}
