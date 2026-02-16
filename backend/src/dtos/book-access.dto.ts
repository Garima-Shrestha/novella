import z from "zod";
import { BookAccessSchema } from "../types/book-access.type";

export const CreateBookAccessDto = BookAccessSchema.pick({
    user: true,
    book: true,
    rentedAt: true,
    expiresAt: true,
    pdfUrl: true,
    bookmarks: true,
    quotes: true,
    lastPosition: true
});

export type CreateBookAccessDto = z.infer<typeof CreateBookAccessDto>;


export const UpdateBookAccessDto = BookAccessSchema.partial();
export type UpdateBookAccessDto = z.infer<typeof UpdateBookAccessDto>;
