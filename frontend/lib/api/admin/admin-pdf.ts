import { API } from "../endpoints";
import axios from "../axios";

// Create Admin PDF
export const createAdminPdf = async (formData: FormData) => {
  try {
    const response = await axios.post(
      API.ADMIN.PDF.CREATE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Create admin PDF failed"
    );
  }
};

// Fetch all Admin PDFs 
export const fetchAdminPdfs = async (
  page: number,
  size: number,
  searchTerm?: string
) => {
  try {
    const response = await axios.get(
      API.ADMIN.PDF.GET_ALL,
      {
        params: { page, size, searchTerm }
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Fetch admin PDFs failed"
    );
  }
};

// Fetch single Admin PDF by ID
export const getAdminPdfById = async (id: string) => {
  try {
    const response = await axios.get(
      API.ADMIN.PDF.GET_ONE(id)
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Get admin PDF failed"
    );
  }
};

// Update Admin PDF
export const updateAdminPdf = async (id: string,formData: FormData) => {
  try {
    const response = await axios.put(
      API.ADMIN.PDF.UPDATE(id),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Update admin PDF failed",
    };
  }
};

// Delete Admin PDF
export const deleteAdminPdf = async (id: string) => {
  try {
    const response = await axios.delete(
      API.ADMIN.PDF.DELETE(id)
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Delete admin PDF failed"
    );
  }
};
