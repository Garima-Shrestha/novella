import axios from "./axios";
import { API } from "./endpoints";

// Fetch history
export const fetchHistory = async (
    params?: { page?: number; size?: number }
) => {
    try {
        const response = await axios.get(API.HISTORY, { params });
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Fetch history failed"
        );
    }
};