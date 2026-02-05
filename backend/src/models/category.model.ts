import mongoose, { Document, Schema } from "mongoose";
import { CategoryType } from "../types/category.type";

const CategorySchema: Schema = new Schema({
    name: { type: String, required: true, unique: true, minLength: 1 },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});

export interface ICategory extends CategoryType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const CategoryModel = mongoose.model<ICategory>("Category", CategorySchema);
