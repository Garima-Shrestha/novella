"use server";

import { fetchMyLibrary } from "../api/my-library";

// Fetch 
export const handleFetchMyLibrary = async (params?: {
  page?: number;
  size?: number;
}) => {
  try {
    const result = await fetchMyLibrary(params);

    if (result.success) {
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };
    }

    return { success: false, message: result.message || "No books found in library" };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Fetch my library failed",
    };
  }
};