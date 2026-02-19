// server side processing
"use server"

import { redirect } from "next/navigation";
import { rentBook, fetchMyBookAccesses, fetchMyBookAccessByBook, addBookmark, removeBookmark, addQuote, removeQuote, updateLastPosition } from "../api/book-access";
import { revalidatePath } from "next/cache";

export const handleRentBook = async (bookId: string, formData: { expiresAt: string }) => {
    try {
        const result = await rentBook(bookId, formData);
        if (result.success) {
            revalidatePath('/user/book-access');
            return {
                success: true,
                message: "Book rented successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Rent book failed"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Rent book failed"
        };
    }
}

export const handleFetchMyBookAccesses = async (page: number, size: number) => {
    try {
        const result = await fetchMyBookAccesses(page, size);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                pagination: result.pagination
            };
        }
        return {
            success: false,
            message: result.message || "Fetch user book accesses failed"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Fetch user book accesses failed"
        };
    }
}

export const handleFetchMyBookAccessByBook = async (bookId: string) => {
    try {
        const result = await fetchMyBookAccessByBook(bookId);
        if (result.success) {
            return {
                success: true,
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Fetch book access failed"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Fetch book access failed"
        };
    }
}

// Add bookmark
export const handleAddBookmark = async (bookId: string, bookmark: any) => {
    try {
        const result = await addBookmark(bookId, bookmark);
        return { success: result.success, data: result.data, message: result.message };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Add bookmark failed" };
    }
}

// Remove bookmark
export const handleRemoveBookmark = async (bookId: string, index: number) => {
    try {
        const result = await removeBookmark(bookId, index);
        return { success: result.success, data: result.data, message: result.message };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Remove bookmark failed" };
    }
}

// Add quote
export const handleAddQuote = async (bookId: string, quote: any) => {
    try {
        const result = await addQuote(bookId, quote);
        return { success: result.success, data: result.data, message: result.message };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Add quote failed" };
    }
}

// Remove quote
export const handleRemoveQuote = async (bookId: string, index: number) => {
    try {
        const result = await removeQuote(bookId, index);
        return { success: result.success, data: result.data, message: result.message };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Remove quote failed" };
    }
}

// Update last position
export const handleUpdateLastPosition = async (bookId: string, lastPosition: any) => {
    try {
        const result = await updateLastPosition(bookId, lastPosition);
        return { success: result.success, data: result.data, message: result.message };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Update last position failed" };
    }
}

