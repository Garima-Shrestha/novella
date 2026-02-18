import { z } from "zod";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

export const AdminPDFSchema = z.object({
    book: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid Book ID" }),
    pdfFile: z
        .instanceof(File)
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: "Max file size is 50MB",
        })
        .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
            message: "Only PDF files are allowed",
        }),
    isActive: z.boolean().optional().default(true),
});

export type AdminPDFData = z.infer<typeof AdminPDFSchema>;


export const AdminPDFUpdateSchema = z.object({
    pdfFile: z
        .instanceof(File)
        .optional()
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
            message: "Max file size is 50MB",
        })
        .refine((file) => !file || ACCEPTED_FILE_TYPES.includes(file.type), {
            message: "Only PDF files are allowed",
        }),
    isActive: z.boolean().optional(),
});

export type AdminPDFUpdateData = z.infer<typeof AdminPDFUpdateSchema>;
