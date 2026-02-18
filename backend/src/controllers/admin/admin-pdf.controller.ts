import { Request, Response } from "express";
import { AdminPDFService } from "../../services/admin/admin-pdf.service";
import { CreateAdminPDFDto, UpdateAdminPDFDto } from "../../dtos/admin-pdf.dto";
import z from "zod";

let adminPDFService = new AdminPDFService();

export class AdminPDFController {

    // Create a new PDF
    async createAdminPDF(req: Request, res: Response) {
        try {
            const bookOnlySchema = z.object({ book: CreateAdminPDFDto.shape.book });
            const parsedBook = bookOnlySchema.safeParse(req.body);

            if (!parsedBook.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedBook.error),
                });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: "PDF file is required" });
            }

            const pdfData = {
                book: parsedBook.data.book,
                pdfUrl: `/uploads/pdfs/${req.file.filename}`,
                isActive: true,
            };

            const parsedData = CreateAdminPDFDto.safeParse(pdfData);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error),
                });
            }

            const pdf = await adminPDFService.createAdminPDF(parsedData.data);

            return res.status(201).json({
                success: true,
                data: pdf,
                message: "PDF created successfully",
            });
            
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    // Get PDF by ID
    async getAdminPDFById(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const pdf = await adminPDFService.getAdminPDFById(id);

            return res.status(200).json({
                success: true,
                data: pdf,
                message: "PDF fetched successfully"
            });

        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get all PDFs (paginated)
    async getAllAdminPDFs(req: Request, res: Response) {
        try {
            const { page, size, searchTerm } = req.query as any;
            const { adminPDFs, pagination } = await adminPDFService.getAllAdminPDFs(page, size, searchTerm);

            return res.status(200).json({
                success: true,
                data: adminPDFs,
                pagination,
                message: "PDFs fetched successfully"
            });

        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Update PDF
    async updateAdminPDF(req: Request, res: Response) {
        try {
            const id = req.params.id;

             if (req.body.isActive !== undefined) {
                req.body.isActive = req.body.isActive === "true";
            }
            
            const parsedData = UpdateAdminPDFDto.pick({ isActive: true }).safeParse(req.body);

            if (!parsedData.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsedData.error) });
            }

            const pdfData: any = { ...parsedData.data };

            if (req.file) {
                pdfData.pdfUrl = `/uploads/pdfs/${req.file.filename}`;
            }

            const updatedPDF = await adminPDFService.updateAdminPDF(id, pdfData);

            return res.status(200).json({
                success: true,
                data: updatedPDF,
                message: "PDF updated successfully"
            });

        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }


    // Delete PDF
    async deleteAdminPDF(req: Request, res: Response) {
        try {
            const id = req.params.id;
            await adminPDFService.deleteAdminPDF(id);

            return res.status(200).json({
                success: true,
                message: "PDF deleted successfully"
            });

        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
