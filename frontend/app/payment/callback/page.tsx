"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handleVerifyKhaltiPayment, handleRentBook } from "@/lib/actions/book-access-action";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  const [bookId, setBookId] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const pidx = searchParams.get("pidx");

        if (!pidx) {
          setStatus("failed");
          setMessage("Payment verification failed. No payment ID found.");
          return;
        }

        const expiresAt = sessionStorage.getItem("khalti_expiresAt");
        const bookId = sessionStorage.getItem("khalti_bookId") || "";
        setBookId(bookId);

        if (!expiresAt || !bookId) {
          setStatus("failed");
          setMessage("Payment session expired. Please try again.");
          return;
        }

        const verifyResult = await handleVerifyKhaltiPayment(pidx);

        if (!verifyResult.success) {
          setStatus("failed");
          setMessage(verifyResult.message || "Payment verification failed.");
          return;
        }

        const paymentStatus = verifyResult.data?.status || verifyResult.data?.data?.status;

        if (paymentStatus !== "Completed") {
          setStatus("failed");
          setMessage(`Payment was not completed. Status: ${paymentStatus}`);
          return;
        }

        const rentResult = await handleRentBook(bookId, { expiresAt });

        if (!rentResult.success) {
            if (rentResult.message?.includes("already rented") || rentResult.message?.includes("already has active access")) {
                sessionStorage.removeItem("khalti_expiresAt");
                sessionStorage.removeItem("khalti_bookId");
                setStatus("success");
                setMessage("Payment successful! Redirecting to your book...");
                setTimeout(() => {
                router.push(`/book-access/${bookId}`);
                }, 2000);
                return;
            }
            setStatus("failed");
            setMessage(rentResult.message || "Payment successful but failed to activate book access. Please contact support.");
            return;
        }

        sessionStorage.removeItem("khalti_expiresAt");
        sessionStorage.removeItem("khalti_bookId");

        setStatus("success");
        setMessage("Payment successful! Redirecting to your book...");

        setTimeout(() => {
          router.push(`/book-access/${bookId}`);
        }, 2000);

      } catch (err: any) {
        setStatus("failed");
        setMessage(err.message || "Something went wrong.");
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full mx-4 p-8 border border-slate-200 rounded-xl shadow-sm text-center">

        {status === "loading" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
            <h1 className="text-xl font-bold text-slate-800">Verifying Payment</h1>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-green-700">Payment Successful!</h1>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-red-700">Payment Failed</h1>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
            <button
                onClick={() => router.push(bookId ? `/books-before-renting/${bookId}` : "/books-before-renting")}
                className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
            >
                Go Back
            </button>
          </>
        )}

      </div>
    </div>
  );
}