import { BookRepository } from "../repositories/book.repository";
import { CreateBookDto, UpdateBookDto } from "../dtos/book.dto";
import { HttpError } from "../errors/http-error";

let bookRepository = new BookRepository();

export class BookService {
    // Create a new book by admin
    async createBook(data: CreateBookDto) {
        // Ensure unique title (case-insensitive)
        const existingBook = await bookRepository.getBookByTitle(data.title);
        if (existingBook) {
            throw new HttpError(409, "Book title already exists");
        }

        const newBook = await bookRepository.createBook(data);
        return newBook;
    }

    // Update book by ID by admin
    async updateBook(bookId: string, data: UpdateBookDto) {
        const book = await bookRepository.getBookById(bookId);
        if (!book) throw new HttpError(404, "Book not found");

        // Check title uniqueness if updating
        if (data.title && data.title.toLowerCase() !== book.title.toLowerCase()) {
            const existingTitle = await bookRepository.getBookByTitle(data.title);
            if (existingTitle) throw new HttpError(409, "Book title already exists");
        }

        const updatedBook = await bookRepository.updateOneBook(bookId, data);
        return updatedBook;
    }

    // Delete a book by admin
    async deleteBook(bookId: string) {
        const book = await bookRepository.getBookById(bookId);
        if (!book) throw new HttpError(404, "Book not found");

        const deleted = await bookRepository.deleteOneBook(bookId);
        return deleted;
    }

    // Get a book by ID by anyone
    async getBookById(bookId: string) {
        const book = await bookRepository.getBookById(bookId);
        if (!book) throw new HttpError(404, "Book not found");
        return book;
    }

    // Get all books by anyone
    async getAllBooks() {
        const books = await bookRepository.getAllBooks();
        return books;
    }
}
