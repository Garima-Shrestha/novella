import mongoose, { Document, Schema } from "mongoose";
import { BookAccessType } from "../types/book-access.type";

const BookAccessSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    rentedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: false },
    isActive: { type: Boolean, default: true },
    pdfUrl: { type: String, required: false },
    bookmarks: [{
        page: { type: Number, required: true },
        text: { type: String, required: true }
    }],
    quotes: [{
        page: { type: Number, required: true },
        text: { type: String, required: true }
    }],
    lastPosition: { type: Number, required: false }
}, {
    timestamps: true,
});

export interface IBookAccess extends BookAccessType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const BookAccessModel = mongoose.model<IBookAccess>("BookAccess", BookAccessSchema);
