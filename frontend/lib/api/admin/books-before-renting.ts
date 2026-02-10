import { API } from "../endpoints";
import axios from "../axios";

// Create a new book 
export const createBook = async (bookData: any) => {
    try {
        const response = await axios.post(
            API.ADMIN.BOOK.CREATE,
            bookData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data', 
                }
            }
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Create book failed');
    }
}

// Fetch all books 
export const fetchBooks = async (
      page: number, size: number, searchTerm?: string
  ) => {
  try {
    const response = await axios.get(
      API.ADMIN.BOOK.GET_ALL,
      {
        params: { page, size, searchTerm }
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Fetch books failed");
  }
};

// Delete a book by ID 
export const deleteBook = async (id: string) => {
  try {
    const response = await axios.delete(API.ADMIN.BOOK.DELETE(id));
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Delete book failed");
  }
};

// Fetch a single book by ID 
export const getBookById = async (id: string) => {
  try {
    const response = await axios.get(API.ADMIN.BOOK.GET_ONE(id));
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Get book failed");
  }
};

// Update a book by ID 
export const updateBook = async (id: string, formData: FormData) => {
  try {
    const response = await axios.put(API.ADMIN.BOOK.UPDATE(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Update book failed",
    };
  }
};
