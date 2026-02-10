import { z } from "zod";

export const CategorySchema = z.object({
    name: z.string().min(1, { message: "Category name is required" }),
    isActive: z.boolean().default(true),
});

export type CategoryData = z.infer<typeof CategorySchema>;


export const CategoryEditSchema = CategorySchema.partial();
export type CategoryEditData = z.infer<typeof CategoryEditSchema>;
