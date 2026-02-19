import z from "zod";

export const rentBookSchema = z.object({
    expiresAt: z
        .string()
        .refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format" })
        .transform(val => new Date(val)),
    });

export const fetchBookAccessesSchema = z.object({
    page: z
        .string()
        .optional()
        .transform(val => (val ? parseInt(val, 10) : 1))
        .refine(val => val > 0, { message: "Page must be greater than 0" }),
    size: z
        .string()
        .optional()
        .transform(val => (val ? parseInt(val, 10) : 10))
        .refine(val => val > 0 && val <= 100, { message: "Size must be between 1 and 100" }),
});
