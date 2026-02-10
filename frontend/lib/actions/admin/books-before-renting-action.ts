"use server";

import { createBook, fetchBooks, getBookById, updateBook, deleteBook } from "@/lib/api/admin/books-before-renting";
import { revalidatePath } from 'next/cache';

// Create a new book
export const handleCreateBook = async (data: FormData) => {
    try {
        const response = await createBook(data)
        if (response.success) {
            revalidatePath('/admin/books-before-renting');
            return {
                success: true,
                message: 'Book created successfully',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Book creation failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Create book action failed' }
    }
}

// Fetch all books
export async function handleGetAllBooks(params: {
    page?: number;
    size?: number;
    searchTerm?: string;
}) {
    try {
        const currentPage = params.page || 1;
        const pageSize = params.size || 10;
        const searchQuery = params.searchTerm || '';

        const response = await fetchBooks(currentPage, pageSize, searchQuery);

        if (response.success) {
            return {
                success: true,
                books: response.data,
                pagination: response.pagination
            };
        }

        return { success: false, books: [], pagination: null };
    } catch (err: Error | any) {
        throw new Error(err.message || "Failed to get books");
    }
}

// Fetch a single book by ID
export const handleGetOneBook = async (id: string) => {
    try {
        const response = await getBookById(id);
        if (response.success) {
            return {
                success: true,
                message: 'Get book by ID successful',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Get book by ID failed'
        }
    } catch (error: Error | any) {
        return {
            success: false,
            message: error.message || 'Get book by ID action failed'
        }
    }
}

// Update a book by ID
export const handleUpdateBook = async (id: string, data: FormData) => {
    try {
        const response = await updateBook(id, data)
        if (response.success) {
            revalidatePath('/admin/books-before-renting');
            return {
                success: true,
                message: 'Book updated successfully',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Update book failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Update book action failed' }
    }
}

// Delete a book by ID
export const handleDeleteBook = async (id: string) => {
    try {
        const response = await deleteBook(id)
        if (response.success) {
            revalidatePath('/admin/books-before-renting');
            return {
                success: true,
                message: 'Book deleted successfully'
            }
        }
        return {
            success: false,
            message: response.message || 'Delete book failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Delete book action failed' }
    }
}
