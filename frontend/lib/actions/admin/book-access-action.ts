"use server";
import { createBookAccess, fetchBookAccess, getBookAccessById, updateBookAccess, deleteBookAccess } from "@/lib/api/admin/book-access";
import { revalidatePath } from 'next/cache';
import { cookies } from "next/headers";

// Create a new book access
// Create a new book access (JSON, no PDF upload)
export const handleCreateBookAccess = async (data: any) => {
    try {
        const response = await createBookAccess(data);

        if (response.success) {
            revalidatePath("/admin/book-access");
            return {
                success: true,
                message: "Book access created successfully",
                data: response.data,
            };
        }
        return {
            success: false,
            message: response.message || "Create book access failed",
        };
    } catch (error: Error | any) {
        return {
            success: false,
            message: error.message || "Create book access action failed",
        };
    }
};

// Fetch all book access entries
export async function handleGetAllBookAccess(params: { page?: number; size?: number; searchTerm?: string }) {
    try {
        const cookieStore = await cookies();  
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return { success: false, bookAccesses: [], pagination: null };
        }

        const currentPage = params.page || 1;
        const pageSize = params.size || 10;
        const searchQuery = params.searchTerm || '';

        const response = await fetchBookAccess(currentPage, pageSize, searchQuery);

        if (response.success) {
            return {
                success: true,
                bookAccesses: response.data,
                pagination: response.pagination
            };

        }

        return { success: false, bookAccesses: [], pagination: null };
    } catch (err: Error | any) {
        throw new Error(err.message || "Failed to get book access entries");
    }
}

// Fetch a single book access entry by ID
export const handleGetOneBookAccess = async (id: string) => {
    try {
        const response = await getBookAccessById(id);
        if (response.success) {
            return {
                success: true,
                message: 'Get book access by ID successful',
                data: response.data
            };
        }
        return {
            success: false,
            message: response.message || 'Get book access by ID failed'
        };
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Get book access action failed' };
    }
};

// Update a book access entry by ID
export const handleUpdateBookAccess = async (id: string, data: FormData) => {
    try {
        const response = await updateBookAccess(id, data);
        if (response.success) {
            revalidatePath('/admin/book-access');
            return {
                success: true,
                message: 'Book access updated successfully',
                data: response.data
            };
        }
        return {
            success: false,
            message: response.message || 'Update book access failed'
        };
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Update book access action failed' };
    }
};

// Delete a book access entry by ID
export const handleDeleteBookAccess = async (id: string) => {
    try {
        const response = await deleteBookAccess(id);
        if (response.success) {
            revalidatePath('/admin/book-access');
            return {
                success: true,
                message: 'Book access deleted successfully'
            };
        }
        return {
            success: false,
            message: response.message || 'Delete book access failed'
        };
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Delete book access action failed' };
    }
};
