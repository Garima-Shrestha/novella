import { API } from "../endpoints";
import axios from "../axios";

// Create a new category
export const createCategory = async (categoryData: any) => {
  try {
    const response = await axios.post(API.ADMIN.CATEGORY.CREATE, categoryData);
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Create category failed");
  }
};

// Fetch all categories 
export const fetchCategories = async () => {
  try {
    const response = await axios.get(API.ADMIN.CATEGORY.GET_ALL);
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Fetch categories failed");
  }
};


// Fetch a single category by ID
export const getCategoryById = async (id: string) => {
  try {
    const response = await axios.get(API.ADMIN.CATEGORY.GET_ONE(id));
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Get category failed");
  }
};

// Update a category by ID
export const updateCategory = async (id: string, categoryData: any) => {
  try {
    const response = await axios.put(API.ADMIN.CATEGORY.UPDATE(id), categoryData);
    return response.data;
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Update category failed",
    };
  }
};

// Delete a category by ID
export const deleteCategory = async (id: string) => {
  try {
    const response = await axios.delete(API.ADMIN.CATEGORY.DELETE(id));
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Delete category failed");
  }
};
