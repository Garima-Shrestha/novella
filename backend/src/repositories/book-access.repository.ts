import { QueryFilter } from "mongoose";
import { IBookAccess, BookAccessModel } from "../models/book-access.model";

export interface IBookAccessRepository {
    createBookAccess(data: Partial<IBookAccess>): Promise<IBookAccess>;
    getBookAccessById(id: string): Promise<IBookAccess | null>;
    getBookAccessByUserAndBook(userId: string, bookId: string): Promise<IBookAccess | null>;
    getActiveAccessByBook(bookId: string): Promise<IBookAccess | null>;
    updateOneBookAccess(id: string, data: Partial<IBookAccess>): Promise<IBookAccess | null>;
    deleteOneBookAccess(id: string): Promise<boolean | null>;

    getAllBookAccessPaginated(page: number,size: number,searchTerm?: string): Promise<{ bookAccesses: IBookAccess[]; total: number }>;
    getBookAccessesByUserPaginated(userId: string, page: number, size: number): Promise<{ bookAccesses: IBookAccess[]; total: number }>; // <- added

}

export class BookAccessRepository implements IBookAccessRepository {
    async createBookAccess(data: Partial<IBookAccess>): Promise<IBookAccess> {
        const bookAccess = new BookAccessModel(data);
        return await bookAccess.save();
    }

    async getBookAccessById(id: string): Promise<IBookAccess | null> {
        return await BookAccessModel.findById(id)
            .populate("user")
            .populate("book");
    }

    async getBookAccessByUserAndBook(userId: string, bookId: string): Promise<IBookAccess | null> {
        return await BookAccessModel.findOne({ user: userId, book: bookId })
            .populate("user")
            .populate("book");
    }

    async getActiveAccessByBook(bookId: string): Promise<IBookAccess | null> {
        return await BookAccessModel.findOne({ book: bookId, isActive: true })
            .populate("user")
            .populate("book");
    }

    async updateOneBookAccess(id: string, data: Partial<IBookAccess>): Promise<IBookAccess | null> {
        return await BookAccessModel.findByIdAndUpdate(id, data, { new: true })
            .populate("user")
            .populate("book");
    }

    async deleteOneBookAccess(id: string): Promise<boolean | null> {
        const result = await BookAccessModel.findByIdAndDelete(id);
        return result ? true : null;
    }

    async getAllBookAccessPaginated(
        page: number,
        size: number,
        searchTerm?: string
    ): Promise<{ bookAccesses: IBookAccess[]; total: number }> {
        const filter: QueryFilter<IBookAccess> = {};

        if (searchTerm) {
            filter.$or = [
                { "book.title": { $regex: searchTerm, $options: "i" } },
                { "user.username": { $regex: searchTerm, $options: "i" } }
            ];
        }

        const [bookAccesses, total] = await Promise.all([
            BookAccessModel.find(filter)
                .skip((page - 1) * size)
                .limit(size)
                .populate("user")
                .populate("book"),
            BookAccessModel.countDocuments(filter)
        ]);

        return { bookAccesses, total };
    }

    async getBookAccessesByUserPaginated(
        userId: string,
        page: number,
        size: number
    ): Promise<{ bookAccesses: IBookAccess[]; total: number }> {
        const filter: QueryFilter<IBookAccess> = { user: userId };

        const [bookAccesses, total] = await Promise.all([
            BookAccessModel.find(filter)
                .skip((page - 1) * size)
                .limit(size)
                .populate("user")
                .populate("book"),
            BookAccessModel.countDocuments(filter)
        ]);

        return { bookAccesses, total };
    }
}
