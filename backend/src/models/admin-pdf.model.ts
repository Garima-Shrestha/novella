import mongoose, { Document, Schema } from "mongoose";
import { AdminPDFType } from "../types/admin-pdf.type";

const AdminPDFSchema: Schema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    pdfUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, required: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true, 
});

export interface IAdminPDF extends Omit<AdminPDFType, "uploadedAt" | "updatedAt">, Document {
    _id: mongoose.Types.ObjectId;
    uploadedAt?: Date;
    updatedAt?: Date;
    createdAt: Date;
    updatedAtTimestamp: Date; 
}

export const AdminPDFModel = mongoose.model<IAdminPDF>("AdminPDF", AdminPDFSchema);
