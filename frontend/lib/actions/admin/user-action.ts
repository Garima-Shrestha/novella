"use server";
import { createUser, fetchUsers, getUserById, updateUser, deleteUser } from "@/lib/api/admin/user";
import { revalidatePath } from 'next/cache';

export const handleCreateUser = async (data: FormData) => {
    try {
        const response = await createUser(data)
        if (response.success) {
            revalidatePath('/admin/users');
            return {
                success: true,
                message: 'Registration successful',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Registration failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Registration action failed' }
    }
}
        
export async function handleGetAllUsers(params: {
    page?: number;
    size?: number;
    searchTerm?: string;
}) {
    try {
        const currentPage = params.page || 1;
        const pageSize = params.size || 10;
        const searchQuery = params.searchTerm || '';

        const response = await fetchUsers(currentPage, pageSize, searchQuery);

        if (response.success) {
            return {
                success: true,
                users: response.data,
                pagination: response.pagination
            };
        }

        return { success: false, users: [], pagination: null };
    } catch (err: Error | any) {
        throw new Error(err.message || "Failed to get users");
    }
}


export const handleGetOneUser = async (id: string) => {
    try {
        const response = await getUserById(id);
        if (response.success) {
            return {
                success: true,
                message: 'Get user by id successful',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Get user by id failed'
        }
    } catch (error: Error | any) {
        return {
            success: false,
            message: error.message || 'Get user by id action failed'
        }
    }
}

export const handleUpdateUser = async (id: string, data: FormData) => {
    try {
        const response = await updateUser(id, data)
        if (response.success) {
            revalidatePath('/admin/users');
            return {
                success: true,
                message: 'Update user successful',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Update user failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Update user action failed' }
    }
}

export const handleDeleteUser = async (id: string) => {
    try {
        const response = await deleteUser(id)
        if (response.success) {
            revalidatePath('/admin/users');
            return {
                success: true,
                message: 'Delete user successful'
            }
        }
        return {
            success: false,
            message: response.message || 'Delete user failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Delete user action failed' }
    }
}
