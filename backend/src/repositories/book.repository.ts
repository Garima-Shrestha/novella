import { IBook, BookModel } from "../models/book.model";

export interface IBookRepository {
    createBook(data: Partial<IBook>): Promise<IBook>;
    getBookByTitle(title: string): Promise<IBook | null>;
    getBookById(id: string): Promise<IBook | null>;
    getAllBooks(): Promise<IBook[]>;
    updateOneBook(id: string, data: Partial<IBook>): Promise<IBook | null>;
    deleteOneBook(id: string): Promise<boolean | null>;
}

export class BookRepository implements IBookRepository {
    async createBook(data: Partial<IBook>): Promise<IBook> {
        const book = new BookModel(data);
        return await book.save();
    }

    async getBookByTitle(title: string): Promise<IBook | null> {
        const book = await BookModel.findOne({ title: { $regex: `^${title}$`, $options: "i" } });
        return book;
    }

    async getBookById(id: string): Promise<IBook | null> {
        const book = await BookModel.findById(id);
        return book;
    }

    async getAllBooks(): Promise<IBook[]> {
        const books = await BookModel.find();
        return books;
    }

    async updateOneBook(id: string, data: Partial<IBook>): Promise<IBook | null> {
        const updatedBook = await BookModel.findByIdAndUpdate(id, data, { new: true });
        return updatedBook;
    }

    async deleteOneBook(id: string): Promise<boolean | null> {
        const result = await BookModel.findByIdAndDelete(id);
        return result ? true : null;
    }
}
