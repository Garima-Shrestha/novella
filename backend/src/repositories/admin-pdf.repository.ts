import { QueryFilter } from "mongoose";
import { IAdminPDF, AdminPDFModel } from "../models/admin-pdf.model";

export interface IAdminPDFRepository {
    createAdminPDF(data: Partial<IAdminPDF>): Promise<IAdminPDF>;
    getAdminPDFById(id: string): Promise<IAdminPDF | null>;
    getAdminPDFByBook(bookId: string): Promise<IAdminPDF | null>;
    updateOneAdminPDF(id: string, data: Partial<IAdminPDF>): Promise<IAdminPDF | null>;
    deleteOneAdminPDF(id: string): Promise<boolean | null>;
    getAllAdminPDFPaginated(page: number, size: number): Promise<{ adminPDFs: IAdminPDF[]; total: number }>;
}

export class AdminPDFRepository implements IAdminPDFRepository {
    async createAdminPDF(data: Partial<IAdminPDF>): Promise<IAdminPDF> {
        const pdf = new AdminPDFModel(data);
        return await pdf.save();
    }

    async getAdminPDFById(id: string): Promise<IAdminPDF | null> {
        return await AdminPDFModel.findById(id).populate("book");
    }

    async getAdminPDFByBook(bookId: string): Promise<IAdminPDF | null> {
        return await AdminPDFModel.findOne({ book: bookId }).populate("book");
    }

    async updateOneAdminPDF(id: string, data: Partial<IAdminPDF>): Promise<IAdminPDF | null> {
        return await AdminPDFModel.findByIdAndUpdate(id, data, { new: true }).populate("book");
    }

    async deleteOneAdminPDF(id: string): Promise<boolean | null> {
        const result = await AdminPDFModel.findByIdAndDelete(id);
        return result ? true : null;
    }

    async getAllAdminPDFPaginated(page: number, size: number): Promise<{ adminPDFs: IAdminPDF[]; total: number }> {
        const [adminPDFs, total] = await Promise.all([
            AdminPDFModel.find()
                .skip((page - 1) * size)
                .limit(size)
                .populate("book"),
            AdminPDFModel.countDocuments()
        ]);
        return { adminPDFs, total };
    }
}
