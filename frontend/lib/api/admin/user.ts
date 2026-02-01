import { API } from "../endpoints";
import axios from "../axios";

export const createUser = async (userData: any) => {
    try {
        const response = await axios.post(
            API.ADMIN.USER.CREATE,
            userData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data', 
                }
            }
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Create user failed');
    }
}

// Fetch all users
export const fetchUsers = async () => {
  try {
    const response = await axios.get(API.ADMIN.USER.GET_ALL);
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Fetch users failed");
  }
};

// Delete a user by ID
export const deleteUser = async (id: string) => {
  try {
    const response = await axios.delete(API.ADMIN.USER.DELETE(id));
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Delete user failed");
  }
};

// Fetch a single user by ID
export const getUserById = async (id: string) => {
  try {
    const response = await axios.get(API.ADMIN.USER.GET_ONE(id));
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Get user failed");
  }
};

// Update a user by ID (multipart for image)
export const updateUser = async (id: string, formData: FormData) => {
  try {
    const response = await axios.put(API.ADMIN.USER.UPDATE(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Update user failed",
    };
  }
};