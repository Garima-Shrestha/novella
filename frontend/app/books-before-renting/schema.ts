import { z } from "zod";

export const FetchBooksSchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    size: z.coerce.number().int().positive().optional(),
    searchTerm: z.string().optional(),
});

export type FetchBooksData = z.infer<typeof FetchBooksSchema>;

export const FetchBookByIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid book ID"),
});

export type FetchBookByIdData = z.infer<typeof FetchBookByIdSchema>;