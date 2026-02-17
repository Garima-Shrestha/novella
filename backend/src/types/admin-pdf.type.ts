import z from "zod";

export const AdminPDFSchema = z.object({
    book: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Book ID"),
    pdfUrl: z.string(),
    uploadedAt: z.date().optional(),
    updatedAt: z.date().optional(),
    isActive: z.boolean().default(true)
});

export type AdminPDFType = z.infer<typeof AdminPDFSchema>;
