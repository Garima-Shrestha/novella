import { QueryFilter } from "mongoose";
import { IAdminPDF, AdminPDFModel } from "../models/admin-pdf.model";
import { BookModel } from "../models/book.model";

export interface IAdminPDFRepository {
    createAdminPDF(data: Partial<IAdminPDF>): Promise<IAdminPDF>;
    getAdminPDFById(id: string): Promise<IAdminPDF | null>;
    getAdminPDFByBook(bookId: string): Promise<IAdminPDF | null>;
    updateOneAdminPDF(id: string, data: Partial<IAdminPDF>): Promise<IAdminPDF | null>;
    deleteOneAdminPDF(id: string): Promise<boolean | null>;
    getAllAdminPDFPaginated( page: number, size: number, searchTerm?: string ): Promise<{ adminPDFs: IAdminPDF[]; total: number }>

    getActivePdfByBook(bookId: string): Promise<IAdminPDF | null>;
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

    async getAllAdminPDFPaginated(
        page: number,
        size: number,
        searchTerm?: string
    ): Promise<{ adminPDFs: IAdminPDF[]; total: number }> {
        const filter: QueryFilter<IAdminPDF> = {};

        if (searchTerm) {
        const books = await BookModel.find(
            { title: { $regex: searchTerm, $options: "i" } },
            { _id: 1 }
        );

        const bookIds = books.map((b) => b._id);

        if (bookIds.length === 0) {
            return { adminPDFs: [], total: 0 };
        }

        filter.book = { $in: bookIds } as any;
        }

        const [adminPDFs, total] = await Promise.all([
        AdminPDFModel.find(filter)
            .skip((page - 1) * size)
            .limit(size)
            .populate("book"),
        AdminPDFModel.countDocuments(filter),
        ]);

        return { adminPDFs, total };
    }

    async getActivePdfByBook(bookId: string): Promise<IAdminPDF | null> {
        return await AdminPDFModel.findOne({ book: bookId, isActive: true }).populate("book");
    }
}
