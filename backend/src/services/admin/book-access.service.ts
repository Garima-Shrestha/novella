import { BookAccessRepository } from "../../repositories/book-access.repository";
import { HttpError } from "../../errors/http-error";


let bookAccessRepo = new BookAccessRepository();

export class AdminBookAccessService {
    // Create Book Access
    async createBookAccess(data: any) {
        const existingAccess = await bookAccessRepo.getActiveAccessByBook(data.book);
        if (existingAccess) {
            throw new HttpError(400, "This book already has an active access");
        }

        const newAccess = await bookAccessRepo.createBookAccess(data);
        return newAccess;
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
}
