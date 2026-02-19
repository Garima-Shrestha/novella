import axios from "./axios";
import { API } from "./endpoints";

// Rent a book
export const rentBook = async (bookId: string, data: { expiresAt: string }) => {
  try {
    const response = await axios.post(API.BOOK_ACCESS.RENT(bookId), data);
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message || err.message || "Rent book failed"
    );
  }
};

// Get all rented books
export const fetchMyBookAccesses = async (page: number, size: number) => {
  try {
    const response = await axios.get(API.BOOK_ACCESS.GET_ALL, {
      params: { page, size },
    });
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message || err.message || "Fetch user book accesses failed"
    );
  }
};

// Get a specific rented book
export const fetchMyBookAccessByBook = async (bookId: string) => {
  try {
    const response = await axios.get(API.BOOK_ACCESS.GET_ONE(bookId));
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message || err.message || "Fetch book access failed"
    );
  }
};

// Add a bookmark
export const addBookmark = async (bookId: string, bookmark: any) => {
  try {
    const response = await axios.post(API.BOOK_ACCESS.ADD_BOOKMARK(bookId), bookmark);
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message || err.message || "Add bookmark failed"
    );
  }
};

// Remove a bookmark
export const removeBookmark = async (bookId: string, index: number) => {
  try {
    const response = await axios.delete(API.BOOK_ACCESS.REMOVE_BOOKMARK(bookId), {
      data: { index },
    });
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message || err.message || "Remove bookmark failed"
    );
  }
};

// Add a quote
export const addQuote = async (bookId: string, quote: any) => {
  try {
    const response = await axios.post(API.BOOK_ACCESS.ADD_QUOTE(bookId), quote);
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message || err.message || "Add quote failed"
    );
  }
};

// Remove a quote
export const removeQuote = async (bookId: string, index: number) => {
  try {
    const response = await axios.delete(API.BOOK_ACCESS.REMOVE_QUOTE(bookId), {
      data: { index },
    });
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message || err.message || "Remove quote failed"
    );
  }
};

// Update last reading position
export const updateLastPosition = async (bookId: string, lastPosition: any) => {
  try {
    const response = await axios.patch(API.BOOK_ACCESS.UPDATE_LAST_POSITION(bookId), lastPosition);
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message || err.message || "Update last position failed"
    );
  }
};
