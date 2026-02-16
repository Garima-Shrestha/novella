import z from "zod";
import { Request, Response } from "express";
import { CreateBookDto, UpdateBookDto } from "../../dtos/book.dto";
import { AdminBookService } from "../../services/admin/book.service";

let adminBookService = new AdminBookService();

interface QueryParams {
    page?: string;
    size?: string;
    searchTerm?: string;
}

export class AdminBookController {
    // Create a new book
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
                parsedData.data.coverImageUrl = `/uploads/images/${req.file.filename}`;
            }

            const newBook = await adminBookService.createBook(parsedData.data);
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

    // Update a book by ID
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
                parsedData.data.coverImageUrl = `/uploads/images/${req.file.filename}`;
            }

            const updatedBook = await adminBookService.updateBook(bookId, parsedData.data);
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

    // Delete a book by ID
    async deleteBook(req: Request, res: Response) {
        try {
            const bookId = req.params.id;
            await adminBookService.deleteBook(bookId);
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

    // Get all books with pagination
    async getAllBooks(req: Request, res: Response) {
        try {
            const { page, size, searchTerm }: QueryParams = req.query;
            const { books, pagination } = await adminBookService.getAllBooksPaginated(page, size, searchTerm);
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

    // Get a single book by ID
    async getBookById(req: Request, res: Response) {
        try {
            const bookId = req.params.id;
            const book = await adminBookService.getBookById(bookId);
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
}
