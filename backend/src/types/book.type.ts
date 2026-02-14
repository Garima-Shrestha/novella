import z from 'zod';

export const BookSchema = z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    description: z.string().optional(),
    genre: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Category ID"),
    publishedDate: z.string().optional(),
    pages: z.preprocess(val => Number(val), z.number().int().positive()),
    price: z.preprocess(val => Number(val), z.number().positive()),
    coverImageUrl: z.string().optional(),
});

export type BookType = z.infer<typeof BookSchema>;
