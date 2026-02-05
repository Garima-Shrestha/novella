import mongoose, { Document, Schema } from "mongoose";
import { BookType } from "../types/book.type";

const BookSchema: Schema = new Schema({
    title: { type: String, required: true, unique: true, minLength: 1 },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    pages: { type: Number, required: true, min: 1 },
    publishedDate: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    coverImageUrl: { type: String, required: true },
    description: { type: String, required: true },
}, {
    timestamps: true,
});

export interface IBook extends BookType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const BookModel = mongoose.model<IBook>("Book", BookSchema);
