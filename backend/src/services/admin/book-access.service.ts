import { BookAccessRepository } from "../../repositories/book-access.repository";
import { HttpError } from "../../errors/http-error";
import { AdminPDFRepository } from "../../repositories/admin-pdf.repository";


let bookAccessRepo = new BookAccessRepository();
let adminPdfRepo = new AdminPDFRepository();

export class AdminBookAccessService {
    // Create Book Access
    async createBookAccess(data: any) {
        const now = new Date();
        const existingActive = await bookAccessRepo.getActiveAccessByUserAndBook(data.user, data.book);

        if (existingActive) {
        const exp = existingActive.expiresAt ? new Date(existingActive.expiresAt) : null;
        const isExpired = !!(exp && exp.getTime() <= now.getTime());

        if (!isExpired) {
            throw new HttpError(
            409,
            `This user already has access to this book until ${existingActive.expiresAt}`
            );
        }
        }

        const activePdf = await adminPdfRepo.getActivePdfByBook(data.book);
        if (!activePdf?.pdfUrl) {
            throw new HttpError(404, "PDF not uploaded for this book yet");
        }

        const payload = {
            rentedAt: data.rentedAt ?? now,
            expiresAt: data.expiresAt,
            isActive: true,
            pdfUrl: activePdf.pdfUrl,
            bookmarks: data.bookmarks ?? [],
            quotes: data.quotes ?? [],
            lastPosition: data.lastPosition,
        };

        try {
            const access = await bookAccessRepo.adminCreateRental(
                data.user,
                data.book,
                payload
            );
            return access;
        } catch (err: any) {
            if (err?.message === "ACTIVE_NOT_EXPIRED") {
                throw new HttpError(409, `This user already has access to this book until ${existingActive?.expiresAt}`);
            }

            if (err?.code === 11000) {
                throw new HttpError(409, "This user already has an active access for this book");
            }
            throw err;
        }
    }

    // Get all book accesses
    async getAllBookAccesses(page?: string, size?: string, searchTerm?: string) {
        const currentPage = page ? parseInt(page, 10) : 1;
        const pageSize = size ? parseInt(size, 10) : 10;

        const { bookAccesses, total } = await bookAccessRepo.getAllBookAccessPaginated(currentPage, pageSize, searchTerm);

        const pagination = {
            page: currentPage,
            size: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        };

        return { bookAccesses, pagination };
    }

    // Get book access by ID
    async getBookAccessById(accessId: string) {
        const access = await bookAccessRepo.getBookAccessById(accessId);
        if (!access) throw new HttpError(404, "Book access not found");
        return access;
    }

    // Admin can update a book access 
    async updateBookAccess(accessId: string, updates: any) {
        const access = await bookAccessRepo.getBookAccessById(accessId);
        if (!access) throw new HttpError(404, "Book access not found");

        const updatedAccess = await bookAccessRepo.updateOneBookAccess(accessId, updates);
        return updatedAccess;
    }

    // Admin can delete a book access
    async deleteBookAccess(accessId: string) {
        const deleted = await bookAccessRepo.deleteOneBookAccess(accessId);
        if (!deleted) throw new HttpError(404, "Book access not found or already deleted");
        return deleted;
    }

    async getAvailableBooksForUser(userId: string, searchTerm?: string) {
        return await bookAccessRepo.getAvailableBooksForUser(userId, searchTerm);
    }
}
