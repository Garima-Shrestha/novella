import z from 'zod';
import { BookSchema } from '../types/book.type';

//  For adding a new book by admin 
export const CreateBookDto = BookSchema.pick({
    title: true,
    author: true,
    genre: true,
    pages: true,
    publishedDate: true,
    price: true,
    coverImageUrl: true,
    description: true
});
export type CreateBookDto = z.infer<typeof CreateBookDto>;


// For admin to update a book
export const UpdateBookDto = BookSchema.partial();
export type UpdateBookDto = z.infer<typeof UpdateBookDto>;
