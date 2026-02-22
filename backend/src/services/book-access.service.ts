import { BookAccessRepository } from "../repositories/book-access.repository";
import { BookRepository } from "../repositories/book.repository";
import { AdminPDFRepository } from "../repositories/admin-pdf.repository";
import { HttpError } from "../errors/http-error";

let bookAccessRepo = new BookAccessRepository();
let bookRepo = new BookRepository();
let adminPdfRepo = new AdminPDFRepository();

export class BookAccessService {

    // Rent a book
    async rentBook(userId: string, bookId: string, expiresAt: Date) {
        if (!expiresAt) throw new HttpError(400, "expiresAt is required");

        const book = await bookRepo.getBookById(bookId);
        if (!book) throw new HttpError(404, "Book not found");

        // fetch active pdf for this book
        const activePdf = await adminPdfRepo.getActivePdfByBook(bookId);
        if (!activePdf?.pdfUrl) throw new HttpError(404, "PDF not uploaded for this book yet");

        const now = new Date();

        const existingAccess = await bookAccessRepo.getBookAccessByUserAndBook(userId, bookId);
        if (existingAccess && existingAccess.isActive && (!existingAccess.expiresAt || existingAccess.expiresAt > now)) {
            throw new HttpError(400, `Book already rented until ${existingAccess.expiresAt}`);
        }

        const newAccessData = {
            user: userId,
            book: bookId,
            rentedAt: now,
            expiresAt: expiresAt,
            isActive: true,
            pdfUrl: activePdf.pdfUrl,
        };

        if (existingAccess) {
            const renewed = await bookAccessRepo.renewBookAccess(existingAccess._id.toString(), newAccessData);
            if (!renewed) throw new HttpError(500, "Failed to renew book access");
            return renewed;
        }

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

    // Get a specific rented book
    async getUserBookAccessByBook(userId: string, bookId: string) {
        const access = await bookAccessRepo.getBookAccessByUserAndBook(userId, bookId);
        if (!access || !access.isActive) throw new HttpError(404, "Book not rented or inactive");

        if (!access.pdfUrl) {
            const activePdf = await adminPdfRepo.getActivePdfByBook(bookId);
            if (activePdf?.pdfUrl) {
                access.pdfUrl = activePdf.pdfUrl;
                await access.save();
            }
        }

        return access;
    }

    // Add a bookmark
    async addBookmark(userId: string, bookId: string, bookmark: any) {
        const access = await bookAccessRepo.addBookmark(userId, bookId, bookmark);
        if (!access) throw new HttpError(404, "Book not rented");
        return access;
    }

    // Remove a bookmark
    async removeBookmark(userId: string, bookId: string, bookmarkIndex: number) {
        const access = await bookAccessRepo.removeBookmark(userId, bookId, bookmarkIndex);
        if (!access) throw new HttpError(404, "Book not rented");
        return access;
    }

    // Add a quote
    async addQuote(userId: string, bookId: string, quote: any) {
        const access = await bookAccessRepo.addQuote(userId, bookId, quote);
        if (!access) throw new HttpError(404, "Book not rented");
        return access;
    }

    // Remove a quote
    async removeQuote(userId: string, bookId: string, quoteIndex: number) {
        const access = await bookAccessRepo.removeQuote(userId, bookId, quoteIndex);
        if (!access) throw new HttpError(404, "Book not rented");
        return access;
    }

    // Update last position
    async updateLastPosition(userId: string, bookId: string, lastPosition: any) {
        const access = await bookAccessRepo.updateLastPosition(userId, bookId, lastPosition);
        if (!access) throw new HttpError(404, "Book not rented");
        return access;
    }


    // // Update reading progress, bookmarks, quotes, last read
    // async updateBookAccess(userId: string, bookId: string, updates: any) {
    //     const access = await bookAccessRepo.getBookAccessByUserAndBook(userId, bookId);
    //     if (!access || !access.isActive) throw new HttpError(404, "Book not rented");

    //     const updatedAccess = await bookAccessRepo.updateOneBookAccess(access._id.toString(), updates);
    //     return updatedAccess;
    // }

    // // Return a rented book
    // async returnBook(userId: string, bookId: string) {
    //     const access = await bookAccessRepo.getBookAccessByUserAndBook(userId, bookId);
    //     if (!access || !access.isActive) throw new HttpError(404, "Book not rented");

    //     const updatedAccess = await bookAccessRepo.updateOneBookAccess(access._id.toString(), {
    //         isActive: false,
    //         expiresAt: new Date(),
    //     });
    //     return updatedAccess;
    // }
}
