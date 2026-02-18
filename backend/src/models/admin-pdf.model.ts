import mongoose, { Document, Schema } from "mongoose";
import { AdminPDFType } from "../types/admin-pdf.type";

const AdminPDFSchema: Schema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    pdfUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true, 
});

export interface IAdminPDF extends AdminPDFType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const AdminPDFModel = mongoose.model<IAdminPDF>("AdminPDF", AdminPDFSchema);
