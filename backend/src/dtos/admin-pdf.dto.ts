import z from "zod";
import { AdminPDFSchema } from "../types/admin-pdf.type";

export const CreateAdminPDFDto = AdminPDFSchema.pick({
    book: true
});
export type CreateAdminPDFDto = z.infer<typeof CreateAdminPDFDto>;


export const UpdateAdminPDFDto = AdminPDFSchema.partial();
export type UpdateAdminPDFDto = z.infer<typeof UpdateAdminPDFDto>;
