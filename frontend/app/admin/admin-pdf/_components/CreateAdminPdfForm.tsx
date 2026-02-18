"use client";

import { Controller, useForm } from "react-hook-form";
import { AdminPDFData, AdminPDFSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";

import { createAdminPdf } from "@/lib/api/admin/admin-pdf";

interface Book {
  _id: string;
  title: string;
}

export default function CreateAdminPdfForm({ books }: { books: Book[] }) {
  const router = useRouter();
    const [pending, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AdminPDFData>({
        resolver: zodResolver(AdminPDFSchema) as any,
        defaultValues: {
        isActive: true,
        },
    });

    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onSubmit = async (data: AdminPDFData) => {
        setError(null);

        startTransition(async () => {
        try {
            const formData = new FormData();
            formData.append("book", data.book);
            formData.append("pdfFile", data.pdfFile);
            formData.append("isActive", String(data.isActive ?? true));

            const response = await createAdminPdf(formData);

            if (!response.success) {
            toast.error(response.message || "Upload PDF failed", {
                containerId: "admin-pdf-create",
            });
            setError(response.message || "Upload PDF failed");
            return;
            }

            toast.success("PDF uploaded successfully", {
            containerId: "admin-pdf-create",
            autoClose: 1000,
            onClose: () => router.push("/admin/admin-pdf"),
            });

            reset({ isActive: true } as any);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err: any) {
            toast.error(err.message || "Upload PDF failed", {
            containerId: "admin-pdf-create",
            });
            setError(err.message || "Upload PDF failed");
        }
        });
    };

    return (
        <div className="p-8 max-w-lg mx-auto bg-white border border-slate-200 rounded-xl shadow-sm mt-10">
        <ToastContainer containerId="admin-pdf-create" position="top-right" autoClose={3000} />

        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-blue-900">
            Upload PDF
            </h2>

            <Link
            href="/admin/admin-pdf"
            className="text-sm text-blue-700 hover:text-blue-800 font-bold transition-colors"
            >
            ← Back
            </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Book Dropdown */}
            <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase">
                Book
            </label>

            <select
                {...register("book")}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-0 focus:border-slate-300 cursor-pointer"
            >
                <option value="">Select a book</option>
                {books.map((b) => (
                <option key={b._id} value={b._id}>
                    {b.title}
                </option>
                ))}
            </select>

            {errors.book && (
                <p className="text-xs text-red-600 font-semibold">{errors.book.message}</p>
            )}
            </div>

            {/* PDF File */}
            <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase">
                PDF File
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
                defaultChecked 
                {...register("isActive")} 
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
            {isSubmitting || pending ? "Uploading..." : "Upload PDF"}
            </button>
        </form>
        </div>
    );
}