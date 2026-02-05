import z from "zod";
import { CreateBookDto, UpdateBookDto } from "../dtos/book.dto";
import { BookService } from "../services/book.service";
import { Request, Response } from "express";

let bookService = new BookService();

export class BookController {

    // Create a new book by admin
    async createBook(req: Request, res: Response) {
        try {
            const parsedData = CreateBookDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }

            if (req.file) {
                parsedData.data.coverImageUrl = `/uploads/${req.file.filename}`;
            }

            const newBook = await bookService.createBook(parsedData.data);
            return res.status(201).json({
                success: true,
                data: newBook,
                message: "Book created successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get a single book by ID by anyone
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


    // Get all books ny anyone
    async getAllBooks(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const books = await bookService.getAllBooks();
            return res.status(200).json({ success: true, data: books, message: "All books fetched successfully" });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }


    // Update a book by ID by admin
    async updateBook(req: Request, res: Response) {
        try {
            const bookId = req.params.id;
            const parsedData = UpdateBookDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }

            if (req.file) {
                parsedData.data.coverImageUrl = `/uploads/${req.file.filename}`;
            }

            const updatedBook = await bookService.updateBook(bookId, parsedData.data);
            return res.status(200).json({
                success: true,
                data: updatedBook,
                message: "Book updated successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Delete a book by ID by admin
    async deleteBook(req: Request, res: Response) {
        try {
            const bookId = req.params.id;
            await bookService.deleteBook(bookId);
            return res.status(200).json({
                success: true,
                message: "Book deleted successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
