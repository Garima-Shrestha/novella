import { ICategory, CategoryModel } from "../models/category.model";

export interface ICategoryRepository {
    createCategory(data: Partial<ICategory>): Promise<ICategory>;
    getCategoryByName(name: string): Promise<ICategory | null>;
    getCategoryById(id: string): Promise<ICategory | null>;
    getAllCategories(): Promise<ICategory[]>;
    updateOneCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null>;
    deleteOneCategory(id: string): Promise<boolean | null>;
}

export class CategoryRepository implements ICategoryRepository {
    async createCategory(data: Partial<ICategory>): Promise<ICategory> {
        const category = new CategoryModel(data);
        return await category.save();
    }

    async getCategoryByName(name: string): Promise<ICategory | null> {
        const category = await CategoryModel.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
        return category;
    }

    async getCategoryById(id: string): Promise<ICategory | null> {
        const category = await CategoryModel.findById(id);
        return category;
    }

    async getAllCategories(): Promise<ICategory[]> {
        const categories = await CategoryModel.find().sort({ name: 1 });
        return categories;
    }

    async updateOneCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
        const updatedCategory = await CategoryModel.findByIdAndUpdate(id, data, { new: true });
        return updatedCategory;
    }

    async deleteOneCategory(id: string): Promise<boolean | null> {
        const result = await CategoryModel.findByIdAndDelete(id);
        return result ? true : false;
    }
}
