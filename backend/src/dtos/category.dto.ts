import z from "zod";
import { CategorySchema } from "../types/category.type";

// create category by admin
export const CreateCategoryDto = CategorySchema.pick({
    name: true,
});
export type CreateCategoryDto = z.infer<typeof CreateCategoryDto>;


// update category (name or isActive) by admin
export const UpdateCategoryDto = CategorySchema.partial();
export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDto>;
