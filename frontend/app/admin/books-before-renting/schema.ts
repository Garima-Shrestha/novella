import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const BookSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    author: z.string().min(1, { message: "Author is required" }),
    genre: z.string().min(1, { message: "Genre is required" }),
    pages: z.coerce
        .number()
        .int({ message: "Pages must be an integer" })
        .positive({ message: "Pages must be a positive number" }),
    publishedDate: z.string().optional(),
    price: z.coerce.number().positive({ message: "Price must be a positive number" }),
    description: z.string().optional(),
    coverImage: z
        .instanceof(File)
        .optional()
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, { message: "Max file size is 5MB" })
        .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
        message: "Only .jpg, .jpeg, .png, and .webp formats are supported",
        }),
});

export type BookData = z.infer<typeof BookSchema>;


export const BookEditSchema = z.object({
    title: z.string().min(1).optional(),
    author: z.string().min(1).optional(),
    genre: z.string().min(1).optional(),
    pages: z.coerce
        .number()
        .int({ message: "Pages must be an integer" })
        .positive({ message: "Pages must be a positive number" }),
    publishedDate: z.string().optional(),
    price: z.coerce.number().positive({ message: "Price must be a positive number" }),
    description: z.string().optional(),
    coverImage: z
        .instanceof(File)
        .optional()
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, { message: "Max file size is 5MB" })
        .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
        message: "Only .jpg, .jpeg, .png, and .webp formats are supported",
        }),
});

export type BookEditData = z.infer<typeof BookEditSchema>;
