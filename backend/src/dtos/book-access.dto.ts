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


export const UserRentBookDto = z.object({
    expiresAt: z.preprocess(val => val ? new Date(val as string) : undefined, z.date())
});
export type UserRentBookDto = z.infer<typeof UserRentBookDto>;

