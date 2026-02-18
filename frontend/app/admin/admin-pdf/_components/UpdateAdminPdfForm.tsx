"use client";

import { Controller, useForm } from "react-hook-form";
import { AdminPDFUpdateData, AdminPDFUpdateSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";

import { updateAdminPdf } from "@/lib/api/admin/admin-pdf";

import dynamic from "next/dynamic";
import type { PdfModalProps } from "@/app/_components/PdfModal";

const PdfModal = dynamic<PdfModalProps>(() => import("@/app/_components/PdfModal"), {
  ssr: false,
});

type AdminPdfBook = {
  _id: string;
  title: string;
};

type AdminPdfRecord = {
  _id: string;
  book?: AdminPdfBook | string;
  pdfUrl?: string;
  isActive?: boolean;
};

export default function UpdateAdminPdfForm({ pdf }: { pdf: AdminPdfRecord }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AdminPDFUpdateData>({
        resolver: zodResolver(AdminPDFUpdateSchema) as any,
        defaultValues: {
        isActive: pdf?.isActive ?? true,
        },
    });

    useEffect(() => {
        reset({ isActive: pdf?.isActive ?? true });
    }, [pdf?.isActive, reset]);

    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [viewPdfUrl, setViewPdfUrl] = useState<string>("");
    const [modalOpen, setModalOpen] = useState(false);

    const fullPdfUrl = pdf?.pdfUrl ? `${BASE_URL}${pdf.pdfUrl}` : "";

    const handleViewPdf = (url: string) => {
        setViewPdfUrl(url);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setViewPdfUrl("");
    };

    const onSubmit = async (data: AdminPDFUpdateData) => {
        setError(null);

        startTransition(async () => {
        try {
            const formData = new FormData();

            if (data.pdfFile) {
            formData.append("pdfFile", data.pdfFile);
            }

            if (data.isActive !== undefined) {
            formData.append("isActive", String(data.isActive));
            }

            const response = await updateAdminPdf(pdf._id, formData);

            if (!response?.success) {
            toast.error(response?.message || "Update PDF failed", {
                containerId: "admin-pdf-edit",
            });
            setError(response?.message || "Update PDF failed");
            return;
            }

            toast.success("PDF updated successfully", {
            containerId: "admin-pdf-edit",
            autoClose: 1000,
            onClose: () => router.push("/admin/admin-pdf"),
            });

            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err: any) {
            toast.error(err.message || "Update PDF failed", {
            containerId: "admin-pdf-edit",
            });
            setError(err.message || "Update PDF failed");
        }
        });
    };

    return (
        <div className="p-8 max-w-lg mx-auto bg-white border border-slate-200 rounded-xl shadow-sm mt-10">
        <ToastContainer containerId="admin-pdf-edit" position="top-right" autoClose={3000} />

        {/* PDF modal (same tab) */}
        <PdfModal
            isOpen={modalOpen}
            onClose={handleCloseModal}
            pdfUrl={viewPdfUrl}
            title="Admin PDF"
            features={{ enableBookmarks: false, enableQuotes: false, enableLastPosition: false }}
        />

        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-blue-900">Edit PDF</h2>

            <Link
            href="/admin/admin-pdf"
            className="text-sm text-blue-700 hover:text-blue-800 font-bold transition-colors"
            >
            ← Back
            </Link>
        </div>

        {/* Quick info (outside form, safe) */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">Book</p>
            <p className="mt-1 text-sm font-bold text-slate-900 break-words">
            {typeof pdf?.book === "object" ? pdf.book?.title : "-"}
            </p>

            <div className="mt-3">
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">Current PDF</p>

            {pdf?.pdfUrl ? (
                <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleViewPdf(fullPdfUrl);
                }}
                className="mt-1 text-sm font-bold text-blue-700 hover:text-blue-800 hover:underline"
                >
                View PDF
                </button>
            ) : (
                <p className="mt-1 text-sm text-slate-700">-</p>
            )}
            </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Replace PDF File */}
            <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                    Replace PDF (optional)
                </label>

                <div className="flex items-center">
                    <Controller
                    name="pdfFile"
                    control={control}
                    render={({ field: { onChange } }) => (
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            className="text-[12px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8] cursor-pointer focus:outline-none"
                            onChange={(e) => onChange(e.target.files?.[0])}
                        />
                    )}
                    />
                </div>

                {errors.pdfFile && (
                    <p className="text-xs text-red-600 font-semibold">{errors.pdfFile.message}</p>
                )}
                </div>

                {/* Active */}
                <div className="flex items-center gap-2">
                <input
                        id="isActive"
                        type="checkbox"
                        checked={!!(control._formValues?.isActive ?? (pdf?.isActive ?? true))}
                        onChange={(e) => setValue("isActive", e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="isActive" className="text-sm text-slate-700 font-bold cursor-pointer">
                        Active
                    </label>
                </div>

                {/* General Error */}
                {error && (
                <p className="text-xs text-red-600 text-center font-bold bg-red-50 py-2 rounded border border-red-100">
                    {error}
                </p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || pending}
                    className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md font-bold text-xs uppercase transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-sm outline-none focus:ring-0"
                >
                    {isSubmitting || pending ? "Updating..." : "Update PDF"}
                </button>
        </form>
        </div>
    );
}
