import z from "zod";
import { KhaltiInitiateSchema, KhaltiLookupSchema } from "../types/khalti.type";

export const InitiateKhaltiPaymentDto = KhaltiInitiateSchema.pick({
    bookId: true, 
    amount: true,
    purchase_order_id: true,
    purchase_order_name: true,
    customer_info: true,
});

export type InitiateKhaltiPaymentDto = z.infer<typeof InitiateKhaltiPaymentDto>;

export const LookupKhaltiPaymentDto = KhaltiLookupSchema.pick({
    pidx: true,
});

export type LookupKhaltiPaymentDto = z.infer<typeof LookupKhaltiPaymentDto>;