import axios from "./axios";
import { API } from "./endpoints";

// Fetch all books 
export const fetchAllBooks = async (params?: { page?: number; size?: number; searchTerm?: string }) => {
    try {
        const response = await axios.get(API.BOOK.GET_ALL, { params });
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Fetch all books failed"
        );
    }
};

// Fetch a single book by ID
export const fetchBookById = async (id: string) => {
    try {
        const response = await axios.get(API.BOOK.GET_ONE(id));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Fetch book by ID failed"
        );
    }
};
