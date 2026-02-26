"use server";

import { fetchHistory } from "../api/history";

// Fetch user history
export const handleFetchMyHistory = async (params?: {
  page?: number;
  size?: number;
}) => {
  try {
    const result = await fetchHistory(params);

    if (result.success) {
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };
    }

    return {
      success: false,
      message: result.message || "No history found",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Fetch history failed",
    };
  }
};