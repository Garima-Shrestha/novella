import { AdminPDFRepository } from "../../repositories/admin-pdf.repository";
import { HttpError } from "../../errors/http-error";
import { CreateAdminPDFDto, UpdateAdminPDFDto } from "../../dtos/admin-pdf.dto";
import { BookRepository } from "../../repositories/book.repository";

const bookRepo = new BookRepository();
let adminPDFRepo = new AdminPDFRepository();

export class AdminPDFService {

    // Create a new PDF for a book
    async createAdminPDF(data: CreateAdminPDFDto) {
        const existing = await adminPDFRepo.getAdminPDFByBook(data.book);
        if (existing) {
            throw new HttpError(400, "This book already has a PDF assigned");
        }

        const book = await bookRepo.getBookById(data.book);
        if (!book) {
            throw new HttpError(404, "Book not found");
        }

        const pdf = await adminPDFRepo.createAdminPDF(data);
        return pdf;
    }

    // Get a PDF by ID
    async getAdminPDFById(id: string) {
        const pdf = await adminPDFRepo.getAdminPDFById(id);
        if (!pdf) throw new HttpError(404, "Admin PDF not found");
        return pdf;
    }

    // Get all PDFs with pagination
    async getAllAdminPDFs(page?: string, size?: string, searchTerm?: string) {
        const currentPage = page ? parseInt(page, 10) : 1;
        const pageSize = size ? parseInt(size, 10) : 10;

        const { adminPDFs, total } = await adminPDFRepo.getAllAdminPDFPaginated(currentPage, pageSize, searchTerm);

        const pagination = {
            page: currentPage,
            size: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        };

        return { adminPDFs, pagination };
    }

    // Update PDF details
    async updateAdminPDF(id: string, updates: UpdateAdminPDFDto) {
        const pdf = await adminPDFRepo.getAdminPDFById(id);
        if (!pdf) throw new HttpError(404, "Admin PDF not found");

        const updated = await adminPDFRepo.updateOneAdminPDF(id, updates);
        return updated;
    }

    // Delete a PDF
    async deleteAdminPDF(id: string) {
        const deleted = await adminPDFRepo.deleteOneAdminPDF(id);
        if (!deleted) throw new HttpError(404, "Admin PDF not found or already deleted");
        return deleted;
    }
}
