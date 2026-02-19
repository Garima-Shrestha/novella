import { Request, Response } from "express";
import { BookAccessService } from "../services/book-access.service";
import { UpdateBookAccessDto, UserRentBookDto } from "../dtos/book-access.dto";
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

            const parsedData = UserRentBookDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsedData.error) });
            }

            const access = await bookAccessService.rentBook(userId, bookId, parsedData.data.expiresAt);

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

    // Add a bookmark
    async addBookmark(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            const bookId = req.params.bookId;
            const bookmark = req.body;

            if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!bookId) return res.status(400).json({ success: false, message: "Book ID is required" });

            const access = await bookAccessService.addBookmark(userId, bookId, bookmark);

            return res.status(200).json({
                success: true,
                data: access,
                message: "Bookmark added successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Remove a bookmark
    async removeBookmark(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            const bookId = req.params.bookId;
            const { index } = req.body;

            if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!bookId) return res.status(400).json({ success: false, message: "Book ID is required" });
            if (index === undefined) return res.status(400).json({ success: false, message: "Bookmark index required" });

            const access = await bookAccessService.removeBookmark(userId, bookId, index);

            return res.status(200).json({
                success: true,
                data: access,
                message: "Bookmark removed successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Add a quote
    async addQuote(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            const bookId = req.params.bookId;
            const quote = req.body;

            if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!bookId) return res.status(400).json({ success: false, message: "Book ID is required" });

            const access = await bookAccessService.addQuote(userId, bookId, quote);

            return res.status(200).json({
                success: true,
                data: access,
                message: "Quote added successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Remove a quote
    async removeQuote(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            const bookId = req.params.bookId;
            const { index } = req.body;

            if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!bookId) return res.status(400).json({ success: false, message: "Book ID is required" });
            if (index === undefined) return res.status(400).json({ success: false, message: "Quote index required" });

            const access = await bookAccessService.removeQuote(userId, bookId, index);

            return res.status(200).json({
                success: true,
                data: access,
                message: "Quote removed successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Update last position
    async updateLastPosition(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            const bookId = req.params.bookId;
            const lastPosition = req.body;

            if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!bookId) return res.status(400).json({ success: false, message: "Book ID is required" });

            const access = await bookAccessService.updateLastPosition(userId, bookId, lastPosition);

            return res.status(200).json({
                success: true,
                data: access,
                message: "Last position updated successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }


    // // Update reading progress, bookmarks, quotes, last read
    // async updateBookAccess(req: Request, res: Response) {
    //     try {
    //         const userId = req.user?._id;
    //         const bookId = req.params.bookId;

    //         if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    //         if (!bookId) return res.status(400).json({ success: false, message: "Book ID is required" });

    //         const parsedData = UpdateBookAccessDto.safeParse(req.body);
    //         if (!parsedData.success) {
    //             return res.status(400).json({ success: false, message: z.prettifyError(parsedData.error) });
    //         }

    //         const updatedAccess = await bookAccessService.updateBookAccess(userId, bookId, parsedData.data);

    //         return res.status(200).json({
    //             success: true,
    //             data: updatedAccess,
    //             message: "Book access updated successfully"
    //         });
    //     } catch (error: any) {
    //         return res.status(error.statusCode || 500).json({
    //             success: false,
    //             message: error.message || "Internal Server Error"
    //         });
    //     }
    // }


    // // Return a rented book
    // async returnBook(req: Request, res: Response) {
    //     try {
    //         const userId = req.user?._id;
    //         const bookId = req.params.bookId;
    //         if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    //         if (!bookId) return res.status(400).json({ success: false, message: "Book ID is required" });

    //         const returnedAccess = await bookAccessService.returnBook(userId, bookId);
    //         return res.status(200).json({
    //             success: true,
    //             data: returnedAccess,
    //             message: "Book returned successfully"
    //         });
    //     } catch (error: any) {
    //         return res.status(error.statusCode || 500).json({
    //             success: false,
    //             message: error.message || "Internal Server Error"
    //         });
    //     }
    // }
}
