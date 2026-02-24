import axios from "./axios";
import { API } from "./endpoints";

// Fetch 
export const fetchMyLibrary = async (params?: { page?: number; size?: number }) => {
    try {
        const response = await axios.get(API.MY_LIBRARY, { params });
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Fetch my library failed"
        );
    }
};