import mongoose, { Document, Schema } from "mongoose";
import { BookAccessType } from "../types/book-access.type";

const TextSelectionSchema = new Schema(
    {
        start: { type: Number, required: true, min: 0 },
        end: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const BookmarkSchema = new Schema(
    {
        page: { type: Number, required: true, min: 1 },
        text: { type: String, required: true },
        selection: { type: TextSelectionSchema, required: false },
    },
    { _id: false }
);

const QuoteSchema = new Schema(
    {
        page: { type: Number, required: true, min: 1 },
        text: { type: String, required: true },
        selection: { type: TextSelectionSchema, required: false },
    },
    { _id: false }
);

const LastPositionSchema = new Schema(
    {
        page: { type: Number, required: true, min: 1 },
        offsetY: { type: Number, required: true },
        zoom: { type: Number, required: false },
    },
    { _id: false }
);

const BookAccessSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    rentedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: false },
    isActive: { type: Boolean, default: true },
    pdfUrl: { type: String, required: false },
    bookmarks: { type: [BookmarkSchema], required: false, default: [] },
    quotes: { type: [QuoteSchema], required: false, default: [] },
    lastPosition: { type: LastPositionSchema, required: false },
}, {
    timestamps: true,
});

BookAccessSchema.index({ user: 1, book: 1 }, { unique: true });

export interface IBookAccess extends BookAccessType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const BookAccessModel = mongoose.model<IBookAccess>("BookAccess", BookAccessSchema);
