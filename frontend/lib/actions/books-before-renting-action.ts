"use server";

import { fetchAllBooks, fetchBookById } from "../api/books-before-renting";

// Fetch all books
export const handleFetchAllBooks = async (params?: {
  page?: number;
  size?: number;
  searchTerm?: string;
}) => {
  try {
    const result = await fetchAllBooks(params);

    if (result.success) {
      return {
        success: true,
        data: result.data,          
        pagination: result.pagination 
      };
    }

    return { success: false, message: "No books found" };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Fetch all books failed",
    };
  }
};

// Fetch a single book by ID
export const handleFetchBookById = async (id: string) => {
  try {
    const result = await fetchBookById(id);

    if (result.success) {
      return {
        success: true,
        data: result.data, 
      };
    }

    return { success: false, message: "Book not found" };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Fetch book by ID failed",
    };
  }
};
