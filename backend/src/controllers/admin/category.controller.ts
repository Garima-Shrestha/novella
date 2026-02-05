import { Request, Response } from "express";
import { AdminCategoryService } from "../../services/admin/category.service";
import { CreateCategoryDto, UpdateCategoryDto } from "../../dtos/category.dto";
import z from "zod";

const adminCategoryService = new AdminCategoryService();

export class AdminCategoryController {
    // Create a new category
    async createCategory(req: Request, res: Response) {
        try {
            const parsedData = CreateCategoryDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }

            const newCategory = await adminCategoryService.createCategory(parsedData.data);
            return res.status(201).json({
                success: true,
                data: newCategory,
                message: "Category created successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Update a category
    async updateCategory(req: Request, res: Response) {
        try {
            const categoryId = req.params.id;
            const parsedData = UpdateCategoryDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }

            const updatedCategory = await adminCategoryService.updateCategory(categoryId, parsedData.data);
            return res.status(200).json({
                success: true,
                data: updatedCategory,
                message: "Category updated successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Delete a category
    async deleteCategory(req: Request, res: Response) {
        try {
            const categoryId = req.params.id;
            const deleted = await adminCategoryService.deleteCategory(categoryId);
            return res.status(200).json({
                success: true,
                message: "Category deleted successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get all categories (optional for admin dashboard)
    async getAllCategories(req: Request, res: Response) {
        try {
            const categories = await adminCategoryService.getAllCategories();
            return res.status(200).json({
                success: true,
                data: categories,
                message: "Categories fetched successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get category by ID (optional for admin dashboard)
    async getCategoryById(req: Request, res: Response) {
        try {
            const categoryId = req.params.id;
            const category = await adminCategoryService.getCategoryById(categoryId);
            return res.status(200).json({
                success: true,
                data: category,
                message: "Category fetched successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
