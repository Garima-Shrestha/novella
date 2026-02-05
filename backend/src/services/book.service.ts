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

    // // Get all books
    // async getAllBooks() {
    //     const books = await bookRepository.getAllBooks();
    //     return books;
    // }


    // Get all boooks
    async getAllBooksPaginated(page?: string, size?: string, searchTerm?: string) {
        const currentPage = page ? parseInt(page, 10) : 1;
        const pageSize = size ? parseInt(size, 10) : 10;

        const { books, total } = await bookRepository.getAllBooksPaginated(currentPage, pageSize, searchTerm);

        return {
            books,
            pagination: {
                page: currentPage,
                size: pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
}
