import { API } from "../endpoints";
import axios from "../axios";

// Create a new book access
export const createBookAccess = async (bookData: any) => {
    try {
        const response = await axios.post(API.ADMIN.BOOK_ACCESS.CREATE, bookData);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(
        error.response?.data?.message || error.message || "Create book access failed"
        );
    }
};

// Fetch all book access 
export const fetchBookAccess = async (page: number, size: number, searchTerm?: string) => {
    try {
        const response = await axios.get(
            API.ADMIN.BOOK_ACCESS.GET_ALL,
            {
                params: { page, size, searchTerm }
            }
        );
        return response.data;
    } catch (err: any) {
        throw new Error(err.response?.data?.message || err.message || "Fetch book access failed");
    }
};

// Fetch a single book access by ID
export const getBookAccessById = async (id: string) => {
    try {
        const response = await axios.get(API.ADMIN.BOOK_ACCESS.GET_ONE(id));
        return response.data;
    } catch (err: any) {
        throw new Error(err.response?.data?.message || err.message || "Get book access failed");
    }
};

// Update a book access by ID
export const updateBookAccess = async (id: string, data: any) => {
    try {
        const response = await axios.put(API.ADMIN.BOOK_ACCESS.UPDATE(id), data);
        return response.data;
    } catch (err: any) {
        return {
        success: false,
        message: err.response?.data?.message || err.message || "Update book access failed",
        };
    }
    };

// Delete a book access by ID
export const deleteBookAccess = async (id: string) => {
    try {
        const response = await axios.delete(API.ADMIN.BOOK_ACCESS.DELETE(id));
        return response.data;
    } catch (err: any) {
        throw new Error(err.response?.data?.message || err.message || "Delete book access failed");
    }
};

// Fetch available books for a user 
export const fetchAvailableBooksForUser = async (userId: string, searchTerm?: string) => {
  try {
    const response = await axios.get(API.ADMIN.BOOK_ACCESS.AVAILABLE_BOOKS, {
      params: { userId, searchTerm },
    });
    return response.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || err.message || "Fetch available books failed"
    );
  }
};

