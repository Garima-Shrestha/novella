"use server"

import { fetchAllCategories, fetchCategoryById } from "../api/category";

// Get all categories
export const handleFetchAllCategories = async () => {
    try {
        const result = await fetchAllCategories();

        if (result.success) {
            return {
                success: true,
                data: result.data
            };
        }

        return {
            success: false,
            message: result.message || "Fetch categories failed"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Fetch categories failed"
        };
    }
};

// Get single category 
export const handleFetchCategoryById = async (id: string) => {
    try {
        const result = await fetchCategoryById(id);

        if (result.success) {
            return {
                success: true,
                data: result.data
            };
        }

        return {
            success: false,
            message: result.message || "Fetch category failed"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Fetch category failed"
        };
    }
};
