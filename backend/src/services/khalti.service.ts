import { HttpError } from "../errors/http-error";
import { KHALTI_BASE_URL, KHALTI_SECRET_KEY, KHALTI_RETURN_URL, KHALTI_WEBSITE_URL } from "../config/khalti";

import { KhaltiRepository } from "../repositories/khalti.repository";
import { BookAccessRepository } from "../repositories/book-access.repository";
import { AdminPDFRepository } from "../repositories/admin-pdf.repository";

let khaltiRepo = new KhaltiRepository();
let bookAccessRepo = new BookAccessRepository();
let adminPdfRepo = new AdminPDFRepository();

export class KhaltiService {
    async initiateKhaltiPayment(data: {
      userId: string;
      bookId: string;
      amount: number;
      purchase_order_id: string;
      purchase_order_name: string;
      customer_info?: { name?: string; email?: string; phone?: string };
    }) {
      const existingActive = await bookAccessRepo.getActiveAccessByUserAndBook(
        data.userId,
        data.bookId
      );

      if (existingActive) {
        throw new HttpError(409, "User already has active access to this book");
      }

      if (!KHALTI_SECRET_KEY) {
        throw new HttpError(500, "Khalti secret key missing");
      }

      const response = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
        method: "POST",
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          return_url: KHALTI_RETURN_URL,
          website_url: KHALTI_WEBSITE_URL,
          amount: data.amount,
          purchase_order_id: data.purchase_order_id,
          purchase_order_name: data.purchase_order_name,
          customer_info: data.customer_info,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new HttpError(
          response.status,
          payload?.message || "Failed to initiate Khalti payment"
        );
      }

      await khaltiRepo.createPayment({
        user: data.userId as any,
        book: data.bookId as any,
        pidx: payload.pidx,
        amount: data.amount,
        purchaseOrderId: data.purchase_order_id,
        purchaseOrderName: data.purchase_order_name,
        status: "Initiated",
        initiateResponse: payload,
        isProcessed: false,
      });

      return {
        pidx: payload.pidx,
        payment_url: payload.payment_url,
        expires_at: payload.expires_at,
      };
    }

  async verifyKhaltiPayment(data: { pidx: string; userId: string }) {
    const payment = await khaltiRepo.getPaymentByPidx(data.pidx);
    if (!payment) {
      throw new HttpError(404, "Payment record not found");
    }

    if (payment.user.toString() !== data.userId.toString()) {
      throw new HttpError(403, "Forbidden");
    }

    if (!KHALTI_SECRET_KEY) {
      throw new HttpError(500, "Khalti secret key missing");
    }

    const response = await fetch(`${KHALTI_BASE_URL}/epayment/lookup/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx: data.pidx }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new HttpError(
        response.status,
        payload?.message || "Failed to verify Khalti payment"
      );
    }

    await khaltiRepo.updatePaymentByPidx(data.pidx, {
      status: payload.status,
      transactionId: payload.transaction_id,
      lookupResponse: payload,
    });

    if (payload.status !== "Completed") {
      return { status: payload.status };
    }

    const latest = await khaltiRepo.getPaymentByPidx(data.pidx);
    if (latest?.isProcessed) {
      return {
        status: "Completed",
        bookAccessId: latest.bookAccess,
      };
    }

    const activePdf = await adminPdfRepo.getActivePdfByBook(
      payment.book.toString()
    );

    if (!activePdf?.pdfUrl) {
      throw new HttpError(404, "PDF not uploaded for this book");
    }

    try {
      const now = new Date();

      const previousAccess = await bookAccessRepo.getPreviousAccessByUserAndBook(
        payment.user.toString(),
        payment.book.toString()
      );

      const carryBookmarks = previousAccess?.bookmarks ?? [];
      const carryQuotes = previousAccess?.quotes ?? [];

      const createdAccess = await bookAccessRepo.createBookAccess({
        user: payment.user,
        book: payment.book,
        rentedAt: now,
        expiresAt: undefined, 
        isActive: true,
        pdfUrl: activePdf.pdfUrl,
        bookmarks: carryBookmarks,
        quotes: carryQuotes,
      } as any);

      await khaltiRepo.updatePaymentByPidx(data.pidx, {
        isProcessed: true,
        processedAt: new Date(),
        bookAccess: createdAccess._id,
      });

      return {
        status: "Completed",
        bookAccessId: createdAccess._id,
      };
    } catch (error: any) {
      if (error?.code === 11000) {
        const existing = await bookAccessRepo.getActiveAccessByUserAndBook(
          payment.user.toString(),
          payment.book.toString()
        );

        if (existing) {
          await khaltiRepo.updatePaymentByPidx(data.pidx, {
            isProcessed: true,
            processedAt: new Date(),
            bookAccess: existing._id,
          });

          return {
            status: "Completed",
            bookAccessId: existing._id,
          };
        }

        throw new HttpError(409, "Active access already exists");
      }

      throw error;
    }
  }
}