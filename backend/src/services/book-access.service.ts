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

        const activePdf = await adminPdfRepo.getActivePdfByBook(bookId);
        if (!activePdf?.pdfUrl) {
            throw new HttpError(404, "PDF not uploaded for this book yet");
        }

        const now = new Date();

        const activeAccess = await bookAccessRepo.getActiveAccessByUserAndBook(userId, bookId);

        if (activeAccess) {
            const exp = activeAccess.expiresAt ? new Date(activeAccess.expiresAt) : null;
            const isExpired = !!(exp && exp.getTime() <= now.getTime());

            if (!isExpired) {
                throw new HttpError(400, `Book already rented until ${activeAccess.expiresAt}`);
            }
        }

        const newAccess = await bookAccessRepo.adminCreateRental(
            userId,
            bookId,
            {
                rentedAt: now,
                expiresAt: expiresAt,
                pdfUrl: activePdf.pdfUrl,
            }
        );

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
        const access = await bookAccessRepo.getActiveAccessByUserAndBook(userId, bookId);

        if (!access) {
            throw new HttpError(404, "Book not rented or inactive");
        }

        const now = new Date();
        const exp = access.expiresAt ? new Date(access.expiresAt) : null;

        if (exp && exp.getTime() <= now.getTime()) {
            throw new HttpError(403, "Rental expired");
        }

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


    // My Library
    async getMyLibrary(userId: string, page?: string, size?: string) {
        const currentPage = page ? parseInt(page, 10) : 1;
        const pageSize = size ? parseInt(size, 10) : 10;

        const { bookAccesses, total } = await bookAccessRepo.getUserLibraryPaginated(
            userId,
            currentPage,
            pageSize
        );

        const now = new Date();

        const items = bookAccesses.map((access: any) => {
            const book = access.book; 

            const totalPages = Number(book?.pages ?? 0);

            const hasLastPosition = !!access?.lastPosition?.page;
            const lastPage = Number(access?.lastPosition?.page ?? 1);

            const progressPercent =
                totalPages > 0
                    ? Math.max(
                        0,
                        Math.min(
                            100,
                            Math.round(
                                ((hasLastPosition ? lastPage : 0) / totalPages) * 100
                            )
                        )
                    )
                    : 0;

            const expiresAt: Date | undefined = access.expiresAt
                ? new Date(access.expiresAt)
                : undefined;

            const isExpired = !!(
                expiresAt && expiresAt.getTime() <= now.getTime()
            );

            let timeLeftLabel = "No expiry";

            if (expiresAt) {
                if (isExpired) {
                    timeLeftLabel = "Rental expired";
                } else {
                    const diffMs = expiresAt.getTime() - now.getTime();
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffMinutes = Math.floor(diffMs / (1000 * 60));

                    if (diffDays >= 1)
                        timeLeftLabel = `Time left ${diffDays} day${diffDays > 1 ? "s" : ""}`;
                    else if (diffHours >= 1)
                        timeLeftLabel = `Time left ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
                    else
                        timeLeftLabel = `Time left ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
                }
            }

            return {
                accessId: access._id?.toString?.() ?? access._id,
                bookId:
                    book?._id?.toString?.() ??
                    access.book?.toString?.() ??
                    access.book,

                title: book?.title,
                author: book?.author, 
                coverImageUrl: book?.coverImageUrl,
                pages: totalPages,

                lastPage,
                progressPercent,

                expiresAt,
                isExpired,
                timeLeftLabel,

                canReRent: isExpired,
            };
        });

        const pagination = {
            page: currentPage,
            size: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        };

        return { items, pagination };
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
