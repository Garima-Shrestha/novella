"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchAllCategories } from "@/lib/api/category";

function safeDateLabel(value: any) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function HistoryList({
  items,
  pagination,
}: {
  items: any[];
  pagination: any;
}) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

  const [genreMap, setGenreMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const res = await fetchAllCategories();
        const list = Array.isArray(res?.data) ? res.data : [];

        const map: Record<string, string> = {};
        for (const cat of list) {
          const id = String(cat?._id ?? "");
          const name = String(cat?.name ?? "");
          if (id && name) map[id] = name;
        }

        setGenreMap(map);
      } catch {
        // ignore
      }
    };

    loadGenres();
  }, []);

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const size = pagination?.size || 10;

  const prevHref = useMemo(
    () => `/history?page=${Math.max(1, currentPage - 1)}&size=${size}`,
    [currentPage, size]
  );

  const nextHref = useMemo(
    () => `/history?page=${Math.min(totalPages, currentPage + 1)}&size=${size}`,
    [currentPage, totalPages, size]
  );

  const activeBookIds = useMemo(() => {
    const set = new Set<string>();
    (items || []).forEach((it: any) => {
      const bookId = String(it?.bookId ?? "");
      if (!bookId) return;

      const isExpired = !!it?.isExpired;
      const isInactive = !!it?.isInactive;

      if (!isExpired && !isInactive) {
        set.add(bookId);
      }
    });
    return set;
  }, [items]);

  return (
    <div className="bg-white font-sans">
      <div className="max-w-4xl mx-auto px-4 py-5">
        <div className="mb-3">
          <h1 className="text-[18px] font-black text-black">History</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Your rental history.
          </p>
        </div>

        <div className="space-y-3">
          {(items || []).map((item: any) => {
            const bookId = String(item?.bookId ?? "");
            const accessId = String(item?.accessId ?? "");
            const key = accessId || `${bookId}-${item?.rentedAt || ""}`;

            const cover = item?.coverImageUrl
              ? item.coverImageUrl.startsWith("http")
                ? item.coverImageUrl
                : `${BASE_URL}${item.coverImageUrl}`
              : "";

            const isExpired = !!item?.isExpired;
            const isInactive = !!item?.isInactive;
            const blocked = isExpired || isInactive;

            const hasActiveNow = bookId ? activeBookIds.has(bookId) : false;

            const cardHref = blocked
              ? hasActiveNow
                ? `/book-access/${bookId}`
                : `/books-before-renting/${bookId}`
              : `/book-access/${bookId}`;

            const showReRent = blocked && !hasActiveNow;

            const rentedLabel = safeDateLabel(item?.rentedAt);
            const expiryLabel = item?.expiresAt
              ? safeDateLabel(item?.expiresAt)
              : "No expiry";

            const rawGenre = item?.genreName ?? item?.genre ?? item?.book?.genre;
            const genreId =
              typeof rawGenre === "string"
                ? rawGenre.trim()
                : typeof rawGenre?._id === "string"
                ? rawGenre._id
                : "";

            const genreName =
              typeof rawGenre === "string" && !/^[0-9a-fA-F]{24}$/.test(rawGenre.trim())
                ? rawGenre.trim()
                : genreMap[genreId] || "—";

            return (
              <div
                key={key}
                className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm"
              >
                <Link href={cardHref} prefetch={false} className="block">
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-[78px] h-[112px] rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                        {cover ? (
                          <img
                            src={cover}
                            alt={item?.title || "Book"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-bold">
                            No Cover
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[15px] font-black text-black leading-snug truncate">
                            {item?.title || "—"}
                          </div>

                          <div className="mt-0.5 text-[11px] text-slate-600 truncate">
                            <span className="font-bold text-slate-700">
                              Author:
                            </span>{" "}
                            {item?.author || "—"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-700 font-semibold">
                        <div>
                          <span className="font-black text-slate-900">
                            Pages:
                          </span>{" "}
                          {item?.pages ?? 0}
                        </div>
                        <div className="truncate">
                          <span className="font-black text-slate-900">
                            Genre:
                          </span>{" "}
                          {genreName}
                        </div>

                        <div>
                          <span className="font-black text-slate-900">
                            Rented:
                          </span>{" "}
                          {rentedLabel}
                        </div>
                        <div>
                          <span className="font-black text-slate-900">
                            Expiry:
                          </span>{" "}
                          {expiryLabel}
                        </div>
                      </div>

                      {blocked && hasActiveNow && (
                        <div className="mt-2 text-[11px] font-bold text-blue-700">
                          Already re-rented — open the book.
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                {showReRent && (
                  <div className="mt-2 flex justify-end">
                    <Link
                      href={`/books-before-renting/${bookId}`}
                      prefetch={false}
                      className="px-3 py-2 rounded-lg bg-red-700 text-white text-[11px] font-black hover:bg-red-800"
                    >
                      Re-rent
                    </Link>
                  </div>
                )}
              </div>
            );
          })}

          {(!items || items.length === 0) && (
            <div className="text-center text-slate-500 text-[12px] py-10">
              No history found.
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <div className="max-w-[1440px] mx-auto px-10 flex items-center justify-between">
            <div className="text-[11px] text-slate-600 font-semibold">
              Page {currentPage} of {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={currentPage === 1 ? "#" : prevHref}
                prefetch={false}
                className={`px-4 py-2 rounded-lg border text-[11px] font-semibold transition ${
                  currentPage === 1
                    ? "bg-slate-100 text-slate-400 border-slate-200 pointer-events-none"
                    : "bg-white text-slate-900 border-slate-300 hover:bg-slate-50"
                }`}
              >
                Previous
              </Link>

              <Link
                href={currentPage === totalPages ? "#" : nextHref}
                prefetch={false}
                className={`px-4 py-2 rounded-lg border text-[11px] font-semibold transition ${
                  currentPage === totalPages
                    ? "bg-slate-100 text-slate-400 border-slate-200 pointer-events-none"
                    : "bg-white text-slate-900 border-slate-300 hover:bg-slate-50"
                }`}
              >
                Next
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}