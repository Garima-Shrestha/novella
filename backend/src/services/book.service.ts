import { BookRepository } from "../repositories/book.repository";
import { HttpError } from "../errors/http-error";

let bookRepository = new BookRepository();

export class BookService {
    // Get a book by ID
    async getBookById(bookId: string) {
        const book = await bookRepository.getBookById(bookId);
        if (!book) throw new HttpError(404, "Book not found");
        return book;
    }

    // Get all books
    async getAllBooks() {
        const books = await bookRepository.getAllBooks();
        return books;
    }
}
