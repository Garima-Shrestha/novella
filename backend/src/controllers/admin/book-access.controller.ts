import { Request, Response } from "express";
import { AdminBookAccessService } from "../../services/admin/book-access.service";
import { CreateBookAccessDto, UpdateBookAccessDto } from "../../dtos/book-access.dto";
import z from "zod";


let adminBookAccessService = new AdminBookAccessService();

export class AdminBookAccessController {
    // Create a new Book Access (with PDF)
    async createBookAccess(req: Request, res: Response) {
        try {
            const parsedData = CreateBookAccessDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsedData.error) });
            }

            const pdfUrl = req.file ? `/uploads/pdfs/${req.file.filename}` : parsedData.data.pdfUrl;

            const access = await adminBookAccessService.createBookAccess({ ...parsedData.data, pdfUrl });

            return res.status(201).json({
                success: true,
                data: access,
                message: "Book access created successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
    
    // Get all book accesses
    async getAllBookAccesses(req: Request, res: Response) {
        try {
            const { page, size, searchTerm } = req.query as any;
            const { bookAccesses, pagination } = await adminBookAccessService.getAllBookAccesses(page, size, searchTerm);

            return res.status(200).json({
                success: true,
                data: bookAccesses,
                pagination,
                message: "All book accesses fetched successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get a specific book access by ID
    async getBookAccessById(req: Request, res: Response) {
        try {
            const accessId = req.params.id;
            const access = await adminBookAccessService.getBookAccessById(accessId);

            return res.status(200).json({
                success: true,
                data: access,
                message: "Book access fetched successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Update a book access
    async updateBookAccess(req: Request, res: Response) {
        try {
            const accessId = req.params.id;

            const parsedData = UpdateBookAccessDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsedData.error) });
            }

            const pdfUrl = req.file ? `/uploads/pdfs/${req.file.filename}` : parsedData.data.pdfUrl;

            const updatedAccess = await adminBookAccessService.updateBookAccess(accessId, { ...parsedData.data, pdfUrl });

            return res.status(200).json({
                success: true,
                data: updatedAccess,
                message: "Book access updated successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Delete a book access
    async deleteBookAccess(req: Request, res: Response) {
        try {
            const accessId = req.params.id;
            await adminBookAccessService.deleteBookAccess(accessId);

            return res.status(200).json({
                success: true,
                message: "Book access deleted successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
