import { CategoryRepository } from "../repositories/category.repository";
import { HttpError } from "../errors/http-error";

const categoryRepository = new CategoryRepository();

export class CategoryService {
    // Get category by ID
    async getCategoryById(id: string) {
        const category = await categoryRepository.getCategoryById(id);
        if (!category || !category.isActive) {
            throw new HttpError(404, "Category not found");
        }
        return category;
    }

    // Get all categories
    async getAllCategories() {
        const categories = await categoryRepository.getAllCategories();
        // filter out inactive categories
        return categories.filter(c => c.isActive);
    }
}
