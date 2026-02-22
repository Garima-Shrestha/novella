import { QueryFilter } from "mongoose";
import { IBookAccess, BookAccessModel } from "../models/book-access.model";
import { BookModel } from "../models/book.model";
import { UserModel } from "../models/user.model";

export interface IBookAccessRepository {
    createBookAccess(data: Partial<IBookAccess>): Promise<IBookAccess>;
    getBookAccessById(id: string): Promise<IBookAccess | null>;
    getBookAccessByUserAndBook(userId: string, bookId: string): Promise<IBookAccess | null>;
    getActiveAccessByBook(bookId: string): Promise<IBookAccess | null>;
    updateOneBookAccess(id: string, data: Partial<IBookAccess>): Promise<IBookAccess | null>;
    deleteOneBookAccess(id: string): Promise<boolean | null>;

    getAllBookAccessPaginated(page: number,size: number,searchTerm?: string): Promise<{ bookAccesses: IBookAccess[]; total: number }>;
    getBookAccessesByUserPaginated(userId: string, page: number, size: number): Promise<{ bookAccesses: IBookAccess[]; total: number }>;

    addBookmark(userId: string, bookId: string, bookmark: any): Promise<IBookAccess | null>;
    removeBookmark(userId: string, bookId: string, bookmarkIndex: number): Promise<IBookAccess | null>;
    addQuote(userId: string, bookId: string, quote: any): Promise<IBookAccess | null>;
    removeQuote(userId: string, bookId: string, quoteIndex: number): Promise<IBookAccess | null>;
    updateLastPosition(userId: string, bookId: string, lastPosition: any): Promise<IBookAccess | null>;
    
    renewBookAccess(id: string, data: Partial<IBookAccess>): Promise<IBookAccess | null>;
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
            const [books, users] = await Promise.all([
                BookModel.find({ title: { $regex: searchTerm, $options: "i" } }, { _id: 1 }),
                UserModel.find({ username: { $regex: searchTerm, $options: "i" } }, { _id: 1 }),
            ]);

            const bookIds = books.map((b) => b._id);
            const userIds = users.map((u) => u._id);

            if (bookIds.length === 0 && userIds.length === 0) {
                return { bookAccesses: [], total: 0 };
            }

            const orFilters: any[] = [];
            if (bookIds.length) orFilters.push({ book: { $in: bookIds } });
            if (userIds.length) orFilters.push({ user: { $in: userIds } });

            filter.$or = orFilters;
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

    async addBookmark(userId: string, bookId: string, bookmark: any) {
        return await BookAccessModel.findOneAndUpdate(
            { user: userId, book: bookId },
            { $push: { bookmarks: bookmark } },
            { new: true }
        ).populate("user").populate("book");
    }

    async removeBookmark(userId: string, bookId: string, bookmarkIndex: number) {
        const access = await BookAccessModel.findOne({ user: userId, book: bookId });
        if (!access) return null;
        access.bookmarks?.splice(bookmarkIndex, 1);
        return await access.save();
    }

    async addQuote(userId: string, bookId: string, quote: any) {
        return await BookAccessModel.findOneAndUpdate(
            { user: userId, book: bookId },
            { $push: { quotes: quote } },
            { new: true }
        ).populate("user").populate("book");
    }

    async removeQuote(userId: string, bookId: string, quoteIndex: number) {
        const access = await BookAccessModel.findOne({ user: userId, book: bookId });
        if (!access) return null;
        access.quotes?.splice(quoteIndex, 1);
        return await access.save();
    }

    async updateLastPosition(userId: string, bookId: string, lastPosition: any) {
        return await BookAccessModel.findOneAndUpdate(
            { user: userId, book: bookId },
            { $set: { lastPosition } },
            { new: true }
        ).populate("user").populate("book");
    }

    async renewBookAccess(id: string, data: Partial<IBookAccess>): Promise<IBookAccess | null> {
        return await BookAccessModel.findByIdAndUpdate(id, data, { new: true })
            .populate("user")
            .populate("book");
    }
}
