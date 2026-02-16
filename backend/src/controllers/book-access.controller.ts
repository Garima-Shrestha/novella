import { Request, Response } from "express";
import { BookAccessService } from "../services/book-access.service";
import { UpdateBookAccessDto } from "../dtos/book-access.dto";
import z from "zod";

let bookAccessService = new BookAccessService();

type QueryParams = {
    page?: string;
    size?: string;
};

export class BookAccessController {

    // Rent a book
    async rentBook(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            const bookId = req.params.bookId;

            if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!bookId) return res.status(400).json({ success: false, message: "Book ID is required" });

            const access = await bookAccessService.rentBook(userId, bookId);

            return res.status(201).json({
                success: true,
                data: access,
                message: "Book rented successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get all books rented by the user
    async getUserBooks(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
             const { page, size }: QueryParams = req.query;

            if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

            const { bookAccesses, pagination } = await bookAccessService.getUserBooks(userId, page, size);

            return res.status(200).json({
                success: true,
                data: bookAccesses,
                pagination,
                message: "User books fetched successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get a specific rented book for the authenticated user
    async getUserBookById(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            const bookId = req.params.bookId;

            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const access = await bookAccessService.getUserBookAccessByBook(userId, bookId);

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

    // Update reading progress, bookmarks, quotes, last read
    async updateBookAccess(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            const bookId = req.params.bookId;

            if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!bookId) return res.status(400).json({ success: false, message: "Book ID is required" });

            const parsedData = UpdateBookAccessDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsedData.error) });
            }

            const updatedAccess = await bookAccessService.updateBookAccess(userId, bookId, parsedData.data);

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


    // Return a rented book
    async returnBook(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            const bookId = req.params.bookId;
            if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!bookId) return res.status(400).json({ success: false, message: "Book ID is required" });

            const returnedAccess = await bookAccessService.returnBook(userId, bookId);
            return res.status(200).json({
                success: true,
                data: returnedAccess,
                message: "Book returned successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
