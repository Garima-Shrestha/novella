import { BookAccessRepository } from "../repositories/book-access.repository";
import { BookRepository } from "../repositories/book.repository";
import { HttpError } from "../errors/http-error";
import { UpdateBookAccessDto } from "../dtos/book-access.dto";

let bookAccessRepo = new BookAccessRepository();
let bookRepo = new BookRepository();

export class BookAccessService {

    // Rent a book
    async rentBook(userId: string, bookId: string) {
        const book = await bookRepo.getBookById(bookId);
        if (!book) throw new HttpError(404, "Book not found");

        const existingAccess = await bookAccessRepo.getBookAccessByUserAndBook(userId, bookId);
        if (existingAccess && existingAccess.isActive) {
            throw new HttpError(400, "Book already rented");
        }

        const newAccessData = {
            user: userId,
            book: bookId,
            rentedAt: new Date().toISOString(),
            isActive: true,
        };

        const newAccess = await bookAccessRepo.createBookAccess(newAccessData);
        return newAccess;
    }


    // Get all books rented by a user
    async getUserBooks(userId: string, page?: string, size?: string) {
        const currentPage = page ? parseInt(page, 10) : 1;
        const pageSize = size ? parseInt(size, 10) : 10;

        const { bookAccesses, total } = await bookAccessRepo.getBookAccessesByUserPaginated(userId, currentPage, pageSize);

        const pagination = {
            page: currentPage,
            size: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        };

        return { bookAccesses, pagination };
    }

    // Get a specific rented book access for a user by bookId
    async getUserBookAccessByBook(userId: string, bookId: string) {
        const access = await bookAccessRepo.getBookAccessByUserAndBook(userId, bookId);

        if (!access || !access.isActive) {
            throw new HttpError(404, "Book not rented or inactive");
        }

        return access;
    }

    // Update reading progress, bookmarks, quotes, last read
    async updateBookAccess(userId: string, bookId: string, updates: UpdateBookAccessDto) {
        const access = await bookAccessRepo.getBookAccessByUserAndBook(userId, bookId);
        if (!access || !access.isActive) throw new HttpError(404, "Book not rented");

        const updatedAccess = await bookAccessRepo.updateOneBookAccess(access._id.toString(), updates);
        return updatedAccess;
    }

    // Return a rented book
    async returnBook(userId: string, bookId: string) {
        const access = await bookAccessRepo.getBookAccessByUserAndBook(userId, bookId);
        if (!access || !access.isActive) throw new HttpError(404, "Book not rented");

        const updatedAccess = await bookAccessRepo.updateOneBookAccess(access._id.toString(), {
            isActive: false,
            expiresAt: new Date().toISOString()
        });
        return updatedAccess;
    }
}
