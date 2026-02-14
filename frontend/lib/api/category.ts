// backend api call only
import axios from "./axios";
import { API } from "./endpoints";

// Fetch all categories
export const fetchAllCategories = async () => {
    try {
        const response = await axios.get(
            API.CATEGORY.GET_ALL
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Fetch categories failed"
        );
    }
};

// Fetch single category
export const fetchCategoryById = async (id: string) => {
    try {
        const response = await axios.get(
            API.CATEGORY.GET_ONE(id)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Fetch category failed"
        );
    }
};
