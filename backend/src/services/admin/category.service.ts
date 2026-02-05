import { CategoryRepository } from "../../repositories/category.repository";
import { CreateCategoryDto, UpdateCategoryDto } from "../../dtos/category.dto";
import { HttpError } from "../../errors/http-error";

const categoryRepository = new CategoryRepository();

export class AdminCategoryService {
    // Create a new category
    async createCategory(data: CreateCategoryDto) {
        data.name = data.name.toLowerCase();
        const existingCategory = await categoryRepository.getCategoryByName(data.name);
        if (existingCategory) {
            throw new HttpError(409, "Category name already exists");
        }

        const newCategory = await categoryRepository.createCategory(data);
        return newCategory;
    }

    // Update a category
    async updateCategory(id: string, data: UpdateCategoryDto) {
        const category = await categoryRepository.getCategoryById(id);
        if (!category) {
            throw new HttpError(404, "Category not found");
        }

        if (data.name && data.name.toLowerCase() !== category.name.toLowerCase()) {  // Check if the request includes a new name (data.name) and whether it's different or same from the current category name (category.name)
            const existingCategory = await categoryRepository.getCategoryByName(data.name);
            if (existingCategory) {
                throw new HttpError(409, "Category name already exists");
            }
            data.name = data.name.toLowerCase()
        }

        const updatedCategory = await categoryRepository.updateOneCategory(id, data);
        return updatedCategory;
    }

    // Delete a category
    async deleteCategory(id: string) {
        const category = await categoryRepository.getCategoryById(id);
        if (!category) {
            throw new HttpError(404, "Category not found");
        }

        const deleted = await categoryRepository.deleteOneCategory(id);
        return deleted;
    }

    // Get all categories
    async getAllCategories() {
        const categories = await categoryRepository.getAllCategories();
        return categories;
    }

    // Get category by ID
    async getCategoryById(id: string) {
        const category = await categoryRepository.getCategoryById(id);
        if (!category) {
            throw new HttpError(404, "Category not found");
        }
        return category;
    }
}
