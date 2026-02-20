"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteBookAccess as deleteBookAccessAPI } from "@/lib/api/admin/book-access";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteModal from "@/app/_components/DeleteModal";
import dynamic from "next/dynamic";
import type { PdfModalProps } from "@/app/_components/PdfModal";

const PdfModal = dynamic<PdfModalProps>(() => import("@/app/_components/PdfModal"), {
  ssr: false,
});

interface PopulatedUser {
  _id: string;
  email?: string;
  username?: string;
}

interface PopulatedBook {
  _id: string;
  title?: string;
}

interface LastPosition {
  page: number;
  offsetY: number;
  zoom?: number;
}

interface BookAccess {
  _id: string;
  user?: PopulatedUser;
  book?: PopulatedBook;
  rentedAt?: string;
  expiresAt?: string;
  isActive?: boolean;
  pdfUrl?: string;
  lastPosition?: LastPosition;
}

function parseDateMs(v?: string) {
  if (!v) return 0;
  const ms = new Date(v).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

function computeStatus(access: BookAccess) {
  const now = Date.now();
  const expMs = parseDateMs(access.expiresAt);

  const expiredByDate = !!expMs && expMs < now;
  const inactive = access.isActive === false;

  if (inactive || expiredByDate) return "Expired";
  return "Active";
}

export default function BookAccessTable({
  accesses,
  pagination,
  search,
}: {
  accesses: BookAccess[];
  pagination: any;
  search?: string;
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [viewPdfUrl, setViewPdfUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

  useEffect(() => {
    if (searchTerm === "" && (search || "") !== "") {
      router.push(`/admin/book-access?page=1&size=${pagination.size}`);
    }
  }, [searchTerm, search, pagination.size, router]);

  const deleteBookAccess = async (id: string) => {
    try {
      await deleteBookAccessAPI(id);
      toast.success("Book access deleted successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const onDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteBookAccess(deleteId);
    setDeleteId(null);
  };

  const handleSearchChange = () => {
    router.push(
      `/admin/book-access?page=1&size=${pagination.size}` +
        (searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : "")
    );
  };

  const handleViewPdf = (pdfUrl: string) => {
    const full = pdfUrl.startsWith("http") ? pdfUrl : `${BASE_URL}${pdfUrl}`;
    setViewPdfUrl(full);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setViewPdfUrl(null);
  };

  const displayRows = useMemo(() => {
    const map = new Map<string, BookAccess[]>();

    for (const a of accesses) {
      const userId = a.user?._id || "unknown_user";
      const bookId = a.book?._id || "unknown_book";
      const key = `${userId}:${bookId}`;
      const arr = map.get(key) || [];
      arr.push(a);
      map.set(key, arr);
    }

    const rows: BookAccess[] = [];

    for (const [, arr] of map) {
      const active = arr.find((x) => x.isActive === true);
      if (active) {
        rows.push(active);
        continue;
      }

      const sorted = [...arr].sort((a, b) => {
        const ar = parseDateMs(a.rentedAt);
        const br = parseDateMs(b.rentedAt);
        if (br !== ar) return br - ar;

        const ae = parseDateMs(a.expiresAt);
        const be = parseDateMs(b.expiresAt);
        return be - ae;
      });

      rows.push(sorted[0]);
    }

    // rows.sort((a, b) => {
    //   const sa = computeStatus(a);
    //   const sb = computeStatus(b);
    //   if (sa !== sb) return sa === "Active" ? -1 : 1;

    //   const ta = (a.book?.title || "").toLowerCase();
    //   const tb = (b.book?.title || "").toLowerCase();
    //   return ta.localeCompare(tb);
    // });

    rows.sort((a, b) => {
      const ar = parseDateMs(a.rentedAt);
      const br = parseDateMs(b.rentedAt);
      if (ar !== br) return ar - br; 
      return (a._id || "").localeCompare(b._id || "");
    });

    return rows;
  }, [accesses]);

  const makePagination = (): React.ReactElement[] => {
    const pages: React.ReactElement[] = [];
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;
    const delta = 2;

    const prevHref =
      `/admin/book-access?page=${currentPage - 1}&size=${pagination.size}` +
      (search ? `&search=${encodeURIComponent(search)}` : "");

    pages.push(
      <Link
        key="prev"
        className={`px-3 py-1 border rounded-md ${
          currentPage === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
            : "bg-white text-blue-500 hover:bg-blue-100"
        }`}
        href={currentPage === 1 ? "#" : prevHref}
      >
        Previous
      </Link>
    );

    let startPage = Math.max(1, currentPage - delta);
    let endPage = Math.min(totalPages, currentPage + delta);

    if (startPage > 1) {
      const href =
        `/admin/book-access?page=1&size=${pagination.size}` +
        (search ? `&search=${encodeURIComponent(search)}` : "");
      pages.push(
        <Link
          key={1}
          className="px-3 py-1 border rounded-md bg-white text-blue-500 hover:bg-blue-100"
          href={href}
        >
          1
        </Link>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const href =
        `/admin/book-access?page=${i}&size=${pagination.size}` +
        (search ? `&search=${encodeURIComponent(search)}` : "");
      pages.push(
        <Link
          key={i}
          className={`px-3 py-1 border rounded-md ${
            i === currentPage
              ? "bg-blue-500 text-white"
              : "bg-white text-blue-500 hover:bg-blue-100"
          }`}
          href={href}
        >
          {i}
        </Link>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
      const href =
        `/admin/book-access?page=${totalPages}&size=${pagination.size}` +
        (search ? `&search=${encodeURIComponent(search)}` : "");
      pages.push(
        <Link
          key={totalPages}
          className="px-3 py-1 border rounded-md bg-white text-blue-500 hover:bg-blue-100"
          href={href}
        >
          {totalPages}
        </Link>
      );
    }

    const nextHref =
      `/admin/book-access?page=${currentPage + 1}&size=${pagination.size}` +
      (search ? `&search=${encodeURIComponent(search)}` : "");

    pages.push(
      <Link
        key="next"
        className={`px-3 py-1 border rounded-md ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
            : "bg-white text-blue-500 hover:bg-blue-100"
        }`}
        href={currentPage === totalPages ? "#" : nextHref}
      >
        Next
      </Link>
    );

    return pages;
  };

  return (
    <div className="p-6 bg-white min-h-screen w-full font-sans antialiased">
      <ToastContainer />

      <DeleteModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={onDeleteConfirm}
        title="Delete Confirmation"
        description="This book access will be permanently removed. Are you sure you want to continue?"
      />

      <PdfModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        pdfUrl={viewPdfUrl || ""}
        title="Book Access PDF"
        features={{ enableBookmarks: false, enableQuotes: false, enableLastPosition: false }}
      />

      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/admin/book-access/create"
          className="text-sm text-white bg-[#00A859] px-4 py-2 rounded font-bold inline-block"
        >
          + Create
        </Link>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchChange();
            }}
            placeholder="Search book accesses..."
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 font-medium focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={handleSearchChange}
            className="text-sm text-white bg-[#2563eb] px-4 py-2 rounded font-bold inline-block"
          >
            Search
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Book</th>
              <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">User Email</th>
              <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Status</th>
              <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">PDF</th>
              <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Last Position</th>
              <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody>
            {displayRows.map((access) => {
              const bookTitle = access.book?.title || "—";
              const userEmail = access.user?.email || "—";
              const status = computeStatus(access);
              const lastPos = access.lastPosition?.page ?? null;

              return (
                <tr key={access._id} className="border-b border-gray-100">
                  <td className="p-4 text-sm text-gray-800">{bookTitle}</td>
                  <td className="p-4 text-sm text-gray-800">{userEmail}</td>

                  <td className="p-4 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black border ${
                        status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {status}
                    </span>
                  </td>

                  <td className="p-4 text-sm text-gray-800">
                    {access.pdfUrl ? (
                      <button
                        type="button"
                        onClick={() => handleViewPdf(access.pdfUrl!)}
                        className="text-blue-600 hover:underline font-bold whitespace-nowrap"
                      >
                        View PDF
                      </button>
                    ) : (
                      <span className="text-gray-500">No PDF</span>
                    )}
                  </td>

                  <td className="p-4 text-sm text-gray-800">
                    {lastPos !== null ? `Page ${lastPos}` : "—"}
                  </td>

                  <td className="p-4 space-x-2 whitespace-nowrap">
                    <Link
                      href={`/admin/book-access/${access._id}`}
                      className="text-xs text-blue-600 border border-blue-600 px-3 py-1.5 rounded font-bold uppercase hover:bg-blue-50"
                    >
                      View
                    </Link>

                    <Link
                      href={`/admin/book-access/${access._id}/edit`}
                      className="text-xs text-white bg-blue-600 px-3 py-1.5 rounded font-bold uppercase hover:bg-blue-700"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => setDeleteId(access._id)}
                      className="text-xs text-white bg-red-600 px-3 py-1.5 rounded font-bold uppercase hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {displayRows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No book accesses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="p-4 flex justify-between items-center bg-gray-50">
          <div className="text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="space-x-2">{makePagination()}</div>
        </div>
      </div>
    </div>
  );
}