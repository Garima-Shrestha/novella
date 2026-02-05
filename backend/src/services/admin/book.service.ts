import { BookRepository } from "../../repositories/book.repository";
import { CreateBookDto, UpdateBookDto } from "../../dtos/book.dto";
import { HttpError } from "../../errors/http-error";

let bookRepository = new BookRepository();

export class AdminBookService {
    // Create a new book
    async createBook(data: CreateBookDto) {
        const existingBook = await bookRepository.getBookByTitle(data.title);
        if (existingBook) {
            throw new HttpError(409, "Book title already exists");
        }

        const newBook = await bookRepository.createBook(data);
        return newBook;
    }

    // Update a book by ID
    async updateBook(bookId: string, data: UpdateBookDto) {
        const book = await bookRepository.getBookById(bookId);
        if (!book) {
            throw new HttpError(404, "Book not found");
        }

        if (data.title && data.title.toLowerCase() !== book.title.toLowerCase()) {
            const existingTitle = await bookRepository.getBookByTitle(data.title);
            if (existingTitle) throw new HttpError(409, "Book title already exists");
        }

        const updatedBook = await bookRepository.updateOneBook(bookId, data);
        return updatedBook;
    }

    // Delete a book by ID
    async deleteBook(bookId: string) {
        const book = await bookRepository.getBookById(bookId);
        if (!book) throw new HttpError(404, "Book not found");

        const deleted = await bookRepository.deleteOneBook(bookId);
        return deleted;
    }

    // Get all books with pagination
    async getAllBooksPaginated(page?: string, size?: string, searchTerm?: string) {
        const currentPage = page ? parseInt(page, 10) : 1;
        const pageSize = size ? parseInt(size, 10) : 10;

        const { books, total } = await bookRepository.getAllBooksPaginated(currentPage, pageSize, searchTerm);

        const pagination = {
            page: currentPage,
            size: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        };

        return { books, pagination };
    }

    // Get a single book by ID
    async getBookById(bookId: string) {
        const book = await bookRepository.getBookById(bookId);
        if (!book) throw new HttpError(404, "Book not found");
        return book;
    }
}
