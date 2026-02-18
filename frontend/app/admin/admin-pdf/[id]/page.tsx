"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { PdfModalProps } from "@/app/_components/PdfModal";

import { getAdminPdfById } from "@/lib/api/admin/admin-pdf";

const PdfModal = dynamic<PdfModalProps>(
  () => import("@/app/_components/PdfModal"),
  { ssr: false }
);

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

  const [pdf, setPdf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrMsg("");

        const res = await getAdminPdfById(id);

        if (!res?.success) {
          router.push("/login");
          return;
        }

        if (alive) setPdf(res.data);
      } catch (e: any) {
        if (alive) setErrMsg(e.message || "Failed to load admin PDF");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, router]);

  const fullPdfUrl = useMemo(() => {
    if (!pdf?.pdfUrl) return "";
    return `${BASE_URL}${pdf.pdfUrl}`;
  }, [pdf, BASE_URL]);

  if (loading) {
    return (
      <div className="bg-white w-full font-sans antialiased p-6">
        Loading...
      </div>
    );
  }

  if (errMsg) {
    return (
      <div className="bg-white w-full font-sans antialiased p-6">
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          {errMsg}
        </div>
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="bg-white w-full font-sans antialiased p-6">
        Not Found: 404
      </div>
    );
  }

  return (
    <div className="bg-white w-full font-sans antialiased">
        <PdfModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            pdfUrl={fullPdfUrl}
            title={pdf?.book?.title || "Admin PDF"}
            features={{
            enableBookmarks: false,
            enableQuotes: false,
            enableLastPosition: false,
            }}
        />

        <div className="mb-6 flex items-center justify-between">
            <Link
            href="/admin/admin-pdf"
            className="text-sm text-blue-700 hover:text-blue-800 font-bold"
            >
            ← Back to PDFs
            </Link>

            <Link
            href={`/admin/admin-pdf/${pdf._id}/edit`}
            className="text-sm text-white bg-[#2563eb] px-4 py-2 rounded font-bold inline-block"
            >
            Edit PDF
            </Link>
        </div>

        <div className="w-full border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="p-7 border-b border-gray-200 bg-[#eef3ff]">
            <div>
                <h1 className="text-xl font-black text-blue-900 leading-6">
                Admin PDF
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                View PDF information
                </p>
            </div>
            </div>

            <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                    Book Title
                </p>
                <p className="mt-1 text-sm text-gray-900 font-semibold break-words">
                    {pdf?.book?.title || "-"}
                </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                    Active
                </p>
                <p className="mt-1 text-sm text-gray-900 font-semibold">
                    {pdf?.isActive ? "Yes" : "No"}
                </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 md:col-span-2">
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                    PDF
                </p>

                {pdf?.pdfUrl ? (
                    <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="mt-1 text-sm font-bold text-blue-700 hover:text-blue-800 hover:underline"
                    >
                    Open PDF
                    </button>
                ) : (
                    <p className="mt-1 text-sm text-gray-900 font-semibold">-</p>
                )}
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}
