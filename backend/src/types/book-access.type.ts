import z from "zod";

export const BookAccessSchema = z.object({
    user: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID"), 
    book: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Book ID"), 
    rentedAt: z.string(),
    expiresAt: z.string().optional(),
    isActive: z.boolean().default(true), 
    pdfUrl: z.string().optional(), 
    bookmarks: z.array(z.string()).optional(),
    quotes: z.array(z.object({
        page: z.number(),
        text: z.string()
    })).optional(), 
    lastPosition: z.number().optional() 
});

export type BookAccessType = z.infer<typeof BookAccessSchema>;
