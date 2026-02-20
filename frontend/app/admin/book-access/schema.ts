import { z } from "zod";

const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB 
const ACCEPTED_PDF_TYPES = ["application/pdf"];

const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ID" });

const DateStringSchema = z
  .string()
  .min(1, { message: "Date is required" })
  .refine((val) => !Number.isNaN(new Date(val).getTime()), {
    message: "Invalid date",
  });

const TextSelectionSchema = z
  .object({
    start: z.number().int().min(0),
    end: z.number().int().min(0),
  })
  .refine((v) => v.end > v.start, {
    message: "Selection end must be greater than start",
  });

const BookmarkSchema = z.object({
  page: z.number().int().min(1, { message: "Page must be at least 1" }),
  text: z.string().min(1, { message: "Text is required" }),
  selection: TextSelectionSchema.optional(),
});

const QuoteSchema = z.object({
  page: z.number().int().min(1, { message: "Page must be at least 1" }),
  text: z.string().min(1, { message: "Text is required" }),
  selection: TextSelectionSchema.optional(),
});

const LastPositionSchema = z.object({
  page: z.number().int().min(1, { message: "Page must be at least 1" }),
  offsetY: z.number(),
  zoom: z.number().optional(),
});

export const BookAccessSchema = z.object({
  user: ObjectIdSchema,
  book: ObjectIdSchema,
  rentedAt: DateStringSchema,
  expiresAt: DateStringSchema.optional(),
  isActive: z.boolean().default(true),
  pdfUrl: z.string().optional(),
  bookmarks: z.array(BookmarkSchema).optional(),
  quotes: z.array(QuoteSchema).optional(),
  lastPosition: LastPositionSchema.optional(),
});

export type BookAccessData = z.infer<typeof BookAccessSchema>;


export const BookAccessCreateSchema = z.object({
  user: ObjectIdSchema,
  book: ObjectIdSchema,
  expiresAt: DateStringSchema.refine((val) => {
    const picked = new Date(`${val}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return picked.getTime() >= today.getTime();
  }, { message: "Expiry date cannot be in the past" }),
  pdfFile: z
    .instanceof(File, { message: "PDF is required" })
    .refine((file) => file.size <= MAX_PDF_SIZE, {
      message: "Max PDF size is 50MB",
    })
    .refine((file) => ACCEPTED_PDF_TYPES.includes(file.type), {
      message: "Only PDF files are allowed",
    }),
});

export type BookAccessCreateData = z.infer<typeof BookAccessCreateSchema>;

export const BookAccessEditSchema = z.object({
  user: ObjectIdSchema.optional(),
  book: ObjectIdSchema.optional(),
  rentedAt: DateStringSchema.optional(),
  expiresAt: DateStringSchema.optional(),
  isActive: z.boolean().optional(),

  pdfUrl: z.string().optional(),

  bookmarks: z.array(BookmarkSchema).optional(),
  quotes: z.array(QuoteSchema).optional(),
  lastPosition: LastPositionSchema.optional(),
});

export type BookAccessEditData = z.infer<typeof BookAccessEditSchema>;