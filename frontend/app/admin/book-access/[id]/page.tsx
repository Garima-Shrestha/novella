import { handleGetOneBookAccess } from "@/lib/actions/admin/book-access-action";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    throw new Error(
      "Book access id missing in route. URL must be /admin/book-access/[id]"
    );
  }

  const response = await handleGetOneBookAccess(id);

  if (!response.success) {
    throw new Error(response.message || "Failed to load book access");
  }

  const access = response.data;

  const bookTitle = access?.book?.title || "—";
  const userEmail = access?.user?.email || access?.user?.username || "—";

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
  const pdfSrc = access?.pdfUrl ? (access.pdfUrl.startsWith("http") ? access.pdfUrl : `${BASE_URL}${access.pdfUrl}`) : null;

  const rentedAt = access?.rentedAt ? new Date(access.rentedAt).toLocaleString() : "-";
  const expiresAt = access?.expiresAt ? new Date(access.expiresAt).toLocaleString() : "-";

  const status = access?.isActive === false
    ? "Inactive"
    : access?.expiresAt && new Date(access.expiresAt).getTime() < Date.now()
      ? "Expired"
      : "Active";

  return (
    <div className="w-full font-sans antialiased">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/book-access"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800"
        >
          <span className="text-lg leading-none">←</span>
          Back to Book Access
        </Link>

        <Link
          href={`/admin/book-access/${id}/edit`}
          className="inline-flex items-center justify-center rounded-md bg-[#2563eb] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8]"
        >
          Edit Book Access
        </Link>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-[#eef3ff] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-black text-blue-900 leading-tight break-words">
                {bookTitle}
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-600">
                View book access information
              </p>
            </div>

            <span
              className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${
                status === "Active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : status === "Expired"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 min-w-0">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                Book
              </p>
              <p className="mt-1 text-sm text-slate-900 break-words">
                {bookTitle}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 min-w-0">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                User
              </p>
              <p className="mt-1 text-sm text-slate-900 break-words">
                {userEmail}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 min-w-0">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                Rented At
              </p>
              <p className="mt-1 text-sm text-slate-900 break-words">
                {rentedAt}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 min-w-0">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                Expires At
              </p>
              <p className="mt-1 text-sm text-slate-900 break-words">
                {expiresAt}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 min-w-0">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                isActive
              </p>
              <p className="mt-1 text-sm text-slate-900 break-words">
                {access?.isActive === false ? "false" : "true"}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 min-w-0">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                Last Position
              </p>
              <p className="mt-1 text-sm text-slate-900 break-words">
                {access?.lastPosition?.page ? `Page ${access.lastPosition.page}` : "—"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 min-w-0">
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
              PDF
            </p>

            {pdfSrc ? (
              <div className="mt-2">
                <a
                  href={pdfSrc}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-800 hover:underline"
                >
                  Open PDF
                </a>

                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                  <iframe
                    src={pdfSrc}
                    className="w-full h-[520px]"
                    title="Book Access PDF"
                  />
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-900">No PDF</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}