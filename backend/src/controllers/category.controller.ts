import { CategoryService } from "../services/category.service";
import { Request, Response } from "express";

const categoryService = new CategoryService();

export class CategoryController {
    // Get all categories
    async getAllCategories(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const categories = await categoryService.getAllCategories();
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

    // Get category by ID
    async getCategoryById(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const categoryId = req.params.id;
            const category = await categoryService.getCategoryById(categoryId);
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
