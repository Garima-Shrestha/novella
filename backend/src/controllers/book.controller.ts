import { BookService } from "../services/book.service";
import { Request, Response } from "express";
import { QueryParams } from "../types/query.type";

let bookService = new BookService();

export class BookController {
    // Get a single book by ID
    async getBookById(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const bookId = req.params.id;
            const book = await bookService.getBookById(bookId);
            return res.status(200).json({
                success: true,
                data: book,
                message: "Book fetched successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // // Get all books
    // async getAllBooks(req: Request, res: Response) {
    //     try {
    //         const userId = req.user?._id;
    //         if (!userId) {
    //             return res.status(401).json({ success: false, message: "Unauthorized" });
    //         }
    //         const books = await bookService.getAllBooks();
    //         return res.status(200).json({ success: true, data: books, message: "All books fetched successfully" });
    //     } catch (error: any) {
    //         return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
    //     }
    // }


    // Get all books pagination
    async getAllBooks(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            // Extract query params for pagination & search
            const { page, size, searchTerm }: QueryParams = req.query;
            const { books, pagination } = await bookService.getAllBooksPaginated(page, size, searchTerm);

            return res.status(200).json({
                success: true,
                data: books,
                pagination,
                message: "Books fetched successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
