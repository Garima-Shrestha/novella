import z from "zod";

const TextSelectionSchema = z.object({
    start: z.number().int().min(0),
    end: z.number().int().min(0),
}).refine((v) => v.end > v.start, {
    message: "Selection end must be greater than start",
});

const BookmarkSchema = z.object({
    page: z.number().int().min(1),
    text: z.string().min(1),
    selection: TextSelectionSchema.optional(),
});

const QuoteSchema = z.object({
    page: z.number().int().min(1),
    text: z.string().min(1),
    selection: TextSelectionSchema.optional(),
});

const LastPositionSchema = z.object({
    page: z.number().int().min(1),
    offsetY: z.number(),
    zoom: z.number().optional(),
});


export const BookAccessSchema = z.object({
    user: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID"), 
    book: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Book ID"), 
    rentedAt: z.preprocess(val => new Date(val as string), z.date()),
    expiresAt: z.preprocess(val => val ? new Date(val as string) : undefined, z.date().optional()), 
    isActive: z.boolean().default(true),
    pdfUrl: z.string().optional(), 
    bookmarks: z.array(BookmarkSchema).optional(),
    quotes: z.array(QuoteSchema).optional(),
    lastPosition: LastPositionSchema.optional(),
});

export type BookAccessType = z.infer<typeof BookAccessSchema>;
