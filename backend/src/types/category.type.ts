import z from "zod";

export const CategorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
    isActive: z.boolean().default(true),
});

export type CategoryType = z.infer<typeof CategorySchema>;
