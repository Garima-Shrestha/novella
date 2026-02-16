"use server";
import { createCategory, fetchCategories, getCategoryById, updateCategory, deleteCategory } from "@/lib/api/admin/category";
import { revalidatePath } from 'next/cache';
import { cookies } from "next/headers";

// Create a new category
export const handleCreateCategory = async (data: any) => {
    try {
        const response = await createCategory(data);
        if (response.success) {
            revalidatePath('/admin/categories');
            return {
                success: true,
                message: 'Category created successfully',
                data: response.data
            };
        }
        return {
            success: false,
            message: response.message || 'Category creation failed'
        };
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Category creation action failed' };
    }
};

// Fetch all categories
export const handleGetAllCategories = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, categories: [] };
    }

    const response = await fetchCategories();

    if (response.success) {
      return {
        success: true,
        categories: response.data,
      };
    }

    return { success: false, categories: [] };
  } catch (err: any) {
    return { success: false, categories: [], message: err.message || "Failed to fetch categories" };
  }
};

// Fetch a single category by ID
export const handleGetOneCategory = async (id: string) => {
    try {
        const response = await getCategoryById(id);
        if (response.success) {
            return {
                success: true,
                message: 'Category fetched successfully',
                data: response.data
            };
        }
        return {
            success: false,
            message: response.message || 'Fetching category failed'
        };
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Fetch category action failed' };
    }
};

// Update a category by ID
export const handleUpdateCategory = async (id: string, data: any) => {
    try {
        const response = await updateCategory(id, data);
        if (response.success) {
            revalidatePath('/admin/categories');
            return {
                success: true,
                message: 'Category updated successfully',
                data: response.data
            };
        }
        return {
            success: false,
            message: response.message || 'Category update failed'
        };
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Category update action failed' };
    }
};

// Delete a category by ID
export const handleDeleteCategory = async (id: string) => {
    try {
        const response = await deleteCategory(id);
        if (response.success) {
            revalidatePath('/admin/categories');
            return {
                success: true,
                message: 'Category deleted successfully'
            };
        }
        return {
            success: false,
            message: response.message || 'Category deletion failed'
        };
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Category delete action failed' };
    }
};
