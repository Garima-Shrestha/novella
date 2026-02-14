import { QueryFilter } from "mongoose";
import { IBook, BookModel } from "../models/book.model";

export interface IBookRepository {
    createBook(data: Partial<IBook>): Promise<IBook>;
    getBookByTitle(title: string): Promise<IBook | null>;
    getBookById(id: string): Promise<IBook | null>;
    // getAllBooks(): Promise<IBook[]>;
    updateOneBook(id: string, data: Partial<IBook>): Promise<IBook | null>;
    deleteOneBook(id: string): Promise<boolean | null>;

    getAllBooksPaginated(page: number, size: number, searchTerm?: string): Promise<{ books: IBook[]; total: number }>;
}

export class BookRepository implements IBookRepository {
    async createBook(data: Partial<IBook>): Promise<IBook> {
        const book = new BookModel(data);
        return await book.save();
    }

    async getBookByTitle(title: string): Promise<IBook | null> {
        const book = await BookModel.findOne({ title: { $regex: `^${title}$`, $options: "i" } }).populate("genre");
        return book;
    }

    async getBookById(id: string): Promise<IBook | null> {
        const book = await BookModel.findById(id).populate("genre");
        return book;
    }

    // async getAllBooks(): Promise<IBook[]> {
    //     const books = await BookModel.find();
    //     return books;
    // }

    async updateOneBook(id: string, data: Partial<IBook>): Promise<IBook | null> {
        const updatedBook = await BookModel.findByIdAndUpdate(id, data, { new: true }).populate("genre");
        return updatedBook;
    }

    async deleteOneBook(id: string): Promise<boolean | null> {
        const result = await BookModel.findByIdAndDelete(id);
        return result ? true : null;
    }

    async getAllBooksPaginated(page: number, size: number, searchTerm?: string)
        : Promise<{ books: IBook[]; total: number }> {
        const filter: QueryFilter<IBook> = {};
        if (searchTerm) {
            filter.$or = [
                { title: { $regex: searchTerm, $options: "i" } },
                { author: { $regex: searchTerm, $options: "i" } },
            ];
        }

        const [books, total] = await Promise.all([
            BookModel.find(filter)
                .skip((page - 1) * size)
                .limit(size)
                .populate("genre"),
            BookModel.countDocuments(filter)
        ]);

        return { books, total };
    }

}
