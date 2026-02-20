"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { BookAccessEditSchema, BookAccessEditData } from "@/app/admin/book-access/schema";
import { updateBookAccess } from "@/lib/api/admin/book-access";

import dynamic from "next/dynamic";
import type { PdfModalProps } from "@/app/_components/PdfModal";

const PdfModal = dynamic<PdfModalProps>(() => import("@/app/_components/PdfModal"), {
  ssr: false,
});

function isoToYYYYMMDD(v: string | undefined) {
  if (!v) return "";
  const d = new Date(v);
  const ms = d.getTime();
  if (Number.isNaN(ms)) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function endOfDayISO(dateStr: string) {
  const d = new Date(`${dateStr}T23:59:59.999`);
  return d.toISOString();
}

function todayYYYYMMDD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function UpdateBookAccessForm({ access }: { access: any }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [oldAccess, setOldAccess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewPdfUrl, setViewPdfUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
  const minDate = useMemo(() => todayYYYYMMDD(), []);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<BookAccessEditData>({
    resolver: zodResolver(BookAccessEditSchema) as any,
  });

  useEffect(() => {
    if (!access) return;

    const expiresAt = isoToYYYYMMDD(access.expiresAt);

    setOldAccess({
      expiresAt: expiresAt || "",
      isActive: access.isActive ?? true,
      pdfUrl: access.pdfUrl || "",
    });

    setValue("expiresAt", (expiresAt || "") as any);
    setValue("isActive", access.isActive ?? true);

    setPdfFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [access, setValue]);

  const handleViewPdf = (pdfUrl: string) => {
    const full = pdfUrl.startsWith("http") ? pdfUrl : `${BASE_URL}${pdfUrl}`;
    setViewPdfUrl(full);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setViewPdfUrl(null);
  };

  const onSubmit = async (data: BookAccessEditData) => {
    if (!oldAccess) return;

    setError(null);

    const newExpires = (data.expiresAt || "").trim();
    const newIsActive = data.isActive;

    // extra guard: block past date even if user hacks input
    if (newExpires) {
      const picked = new Date(`${newExpires}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (picked.getTime() < today.getTime()) {
        toast.error("Expiry date cannot be in the past", { containerId: "admin-book-access-edit" });
        return;
      }
    }

    const expiresChanged = newExpires !== (oldAccess.expiresAt || "");
    const activeChanged = (newIsActive ?? true) !== (oldAccess.isActive ?? true);
    const pdfChanged = !!pdfFile;

    const isChanged = expiresChanged || activeChanged || pdfChanged;

    if (!isChanged) {
      toast.info("No changes detected", { containerId: "admin-book-access-edit" });
      return;
    }

    const formData = new FormData();

    if (expiresChanged && newExpires) {
      formData.append("expiresAt", endOfDayISO(newExpires));
    }

    if (activeChanged) {
      formData.append("isActive", String(newIsActive));
    }

    if (pdfChanged && pdfFile) {
      formData.append("pdfUrl", pdfFile);
    }

    startTransition(async () => {
      try {
        const res = await updateBookAccess(access._id, formData);

        if (!res?.success) {
          toast.error(res?.message || "Update failed", { containerId: "admin-book-access-edit" });
          setError(res?.message || "Update failed");
          return;
        }

        toast.success("Book access updated successfully", {
          containerId: "admin-book-access-edit",
          autoClose: 1000,
          onClose: () => router.push("/admin/book-access"),
        });
      } catch (e: any) {
        toast.error(e?.message || "Update failed", { containerId: "admin-book-access-edit" });
        setError(e?.message || "Update failed");
      }
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <ToastContainer containerId="admin-book-access-edit" position="top-right" autoClose={3000} />

      <PdfModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        pdfUrl={viewPdfUrl || ""}
        title="Book Access PDF"
        features={{ enableBookmarks: false, enableQuotes: false, enableLastPosition: false }}
      />

      <div className="w-full max-w-xl bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-black tracking-tight text-blue-900 mb-8">
          Edit Book Access
        </h2>

        <div className="mb-6 space-y-1 text-sm text-slate-700">
          <div className="font-bold">
            Book: <span className="font-medium">{access?.book?.title || "—"}</span>
          </div>
          <div className="font-bold">
            User: <span className="font-medium">{access?.user?.email || access?.user?.username || "—"}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Expires At */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase">
              Expires At
            </label>
            <input
              type="date"
              min={minDate}
              {...register("expiresAt")}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none"
            />
            {errors.expiresAt?.message && (
              <p className="text-xs text-red-600">{errors.expiresAt.message as any}</p>
            )}
          </div>

          {/* isActive */}
          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              defaultChecked
              {...register("isActive")}
              className="h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-sm text-slate-700 font-bold cursor-pointer">
              Active
            </label>
          </div>

          {/* Current PDF */}
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide mb-2">
              Current PDF
            </p>

            {access?.pdfUrl ? (
              <button
                type="button"
                onClick={() => handleViewPdf(access.pdfUrl)}
                className="text-sm text-blue-700 hover:text-blue-800 font-bold transition-colors"
              >
                View current PDF
              </button>
            ) : (
              <p className="text-sm text-slate-600 font-semibold">No PDF</p>
            )}
          </div>

          {/* Replace PDF */}
          <div className="space-y-2 rounded-lg border border-slate-200 p-4">
            <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">
              Replace PDF (Optional)
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[11px] file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 text-center font-bold bg-red-50 py-2 rounded border border-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || pending}
            className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md font-bold text-xs uppercase transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-sm"
          >
            {isSubmitting || pending ? "Updating..." : "Update Book Access"}
          </button>
        </form>
      </div>
    </div>
  );
}