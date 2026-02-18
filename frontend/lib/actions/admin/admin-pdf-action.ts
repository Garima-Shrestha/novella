"use server";

import { createAdminPdf, fetchAdminPdfs, getAdminPdfById, updateAdminPdf, deleteAdminPdf } from "@/lib/api/admin/admin-pdf";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// Create Admin PDF
export const handleCreateAdminPdf = async (data: FormData) => {
  try {
    const response = await createAdminPdf(data);

    if (response.success) {
      revalidatePath("/admin/admin-pdf");
      return {
        success: true,
        message: "Admin PDF created successfully",
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || "Create admin PDF failed",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Create admin PDF action failed",
    };
  }
};

// Get All Admin PDFs
export async function handleGetAllAdminPdfs(params: {
  page?: number;
  size?: number;
  searchTerm?: string;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, pdfs: [], pagination: null };
    }

    const currentPage = params.page || 1;
    const pageSize = params.size || 10;
    const searchQuery = params.searchTerm || '';

    const response = await fetchAdminPdfs(currentPage, pageSize, searchQuery);

    if (response.success) {
      return {
        success: true,
        pdfs: response.data,
        pagination: response.pagination,
      };
    }

    return { success: false, pdfs: [], pagination: null };
  } catch (err: any) {
    throw new Error(err.message || "Failed to get admin PDFs");
  }
}

// Get One Admin PDF
export const handleGetOneAdminPdf = async (id: string) => {
  try {
    const response = await getAdminPdfById(id);

    if (response.success) {
      return {
        success: true,
        message: "Get admin PDF successful",
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || "Get admin PDF failed",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Get admin PDF action failed",
    };
  }
};

// Update Admin PDF
export const handleUpdateAdminPdf = async (id: string,data: FormData) => {
  try {
    const response = await updateAdminPdf(id, data);

    if (response.success) {
      revalidatePath("/admin/admin-pdf");
      return {
        success: true,
        message: "Update admin PDF successful",
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || "Update admin PDF failed",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Update admin PDF action failed",
    };
  }
};

// Delete Admin PDF
export const handleDeleteAdminPdf = async (id: string) => {
  try {
    const response = await deleteAdminPdf(id);

    if (response.success) {
      revalidatePath("/admin/admin-pdf");
      return {
        success: true,
        message: "Delete admin PDF successful",
      };
    }

    return {
      success: false,
      message: response.message || "Delete admin PDF failed",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Delete admin PDF action failed",
    };
  }
}