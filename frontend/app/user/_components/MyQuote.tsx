"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { handleFetchMyBookAccesses, handleRemoveQuote } from "@/lib/actions/book-access-action";

interface TextSelection {
  start: number;
  end: number;
}

interface Quote {
  page: number;
  text: string;
  selection?: TextSelection;
}

interface BookMini {
  _id: string;
  title?: string;
  author?: string;
  coverImageUrl?: string;
}

interface BookAccessRow {
  _id: string;
  book: BookMini;
  expiresAt?: string;
  isActive?: boolean;
  quotes?: Quote[];
}

type FlattenedQuote = {
  bookId: string;
  accessId: string;

  bookTitle: string;
  bookAuthor?: string;
  coverImageUrl?: string;

  quoteIndex: number;
  quote: Quote;

  isExpired: boolean;
};

function getExpiryMsFrontend(expiresAt: string): number {
  const isMidnightUTC =
    /T00:00:00(\.000)?Z$/.test(expiresAt) || /^\d{4}-\d{2}-\d{2}$/.test(expiresAt);

  if (isMidnightUTC) {
    const datePart = expiresAt.slice(0, 10);
    const y = parseInt(datePart.slice(0, 4), 10);
    const m = parseInt(datePart.slice(5, 7), 10);
    const d = parseInt(datePart.slice(8, 10), 10);
    return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
  }

  return new Date(expiresAt).getTime();
}

function isExpiredAccess(access: BookAccessRow): boolean {
  if (access.isActive === false) return true;
  if (!access.expiresAt) return false;

  const expMs = getExpiryMsFrontend(access.expiresAt);
  if (!expMs || Number.isNaN(expMs)) return false;

  return Date.now() > expMs;
}

export default function MyQuote() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<BookAccessRow[]>([]);
  const [page, setPage] = useState(1);

  const [removing, setRemoving] = useState<{ bookId: string; quoteIndex: number } | null>(null);

  const PAGE_SIZE = 20;

  const fetchAccesses = async (p: number) => {
    setLoading(true);
    try {
      const res = await handleFetchMyBookAccesses(p, PAGE_SIZE);

      if (!res.success) {
        toast.error(res.message || "Failed to load quotes");
        setRows([]);
        return;
      }

      setRows((res.data || []) as BookAccessRow[]);
    } catch (e: any) {
      toast.error(e.message || "Failed to load quotes");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccesses(page);
  }, [page]);

  const grouped = useMemo(() => {
    const flat: FlattenedQuote[] = [];

    for (const access of rows) {
      const quotes = access.quotes || [];
      if (!quotes.length) continue;

      const bookId = access.book?._id;
      if (!bookId) continue;

      const expired = isExpiredAccess(access);
      const bookTitle = access.book?.title || "Untitled book";

      quotes.forEach((q, idx) => {
        flat.push({
          bookId,
          accessId: access._id,
          bookTitle,
          bookAuthor: access.book?.author,
          coverImageUrl: access.book?.coverImageUrl,
          quoteIndex: idx,
          quote: q,
          isExpired: expired,
        });
      });
    }

    const map = new Map<string, FlattenedQuote[]>();
    for (const item of flat) {
      if (!map.has(item.bookId)) map.set(item.bookId, []);
      map.get(item.bookId)!.push(item);
    }

    return Array.from(map.entries());
  }, [rows]);

  const removeQuote = async (bookId: string, quoteIndex: number) => {
    setRemoving({ bookId, quoteIndex });
    try {
      const res = await handleRemoveQuote(bookId, quoteIndex);
      if (res.success) {
        toast.success("Quote removed");
        fetchAccesses(page); 
      } else {
        toast.error(res.message || "Failed to remove quote");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to remove quote");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 bg-gray-50/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black">My Quotes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Quotes stay visible here even when your rent expires.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-gray-50/40">
          <div className="text-sm font-black text-black">Page {page}</div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-black text-black hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>

            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-black text-black hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>        

        {loading ? (
          <div className="p-6 text-sm text-gray-600">Loading your quotes…</div>
        ) : grouped.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">No quotes yet.</div>
        ) : (
          <div className="p-4 space-y-8">
            {grouped.map(([bookId, items]) => {
              const first = items[0];

              const cover = first.coverImageUrl
                ? first.coverImageUrl.startsWith("http")
                  ? first.coverImageUrl
                  : `${BASE_URL}${first.coverImageUrl}`
                : "";

              const hasActiveNow = items.some((x) => !x.isExpired);
              const expired = !hasActiveNow;

              return (
                <div key={bookId} className="rounded-2xl border border-gray-200/70 bg-white shadow-md overflow-hidden">
                  <div className="flex items-center gap-4 border-b border-gray-200/60 p-4 bg-gray-50/40">
                    <div className="h-16 w-12 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      {cover ? (
                        <img src={cover} alt={first.bookTitle} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-gray-400">
                          No Cover
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-black text-black">{first.bookTitle}</div>
                      <div className="truncate text-xs text-gray-600">
                        {first.bookAuthor ? `by ${first.bookAuthor}` : ""}
                      </div>

                      <div className="mt-1 text-[11px] font-black text-gray-700">
                        {expired ? "Rent expired (quotes still visible)." : "Active rent."}
                      </div>
                    </div>

                    {/* ✅ Show Open book ONLY if NOT expired */}
                    {!expired && (
                      <Link
                        href={`/book-access/${bookId}`}
                        className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black text-black hover:bg-gray-50"
                      >
                        Open book
                      </Link>
                    )}
                  </div>

                  <div className="p-4 pt-3">
                    <ul className="space-y-2">
                      {items.map((item) => {
                        const key = `${item.accessId}-${item.quoteIndex}-${item.quote.page}`;
                        const isRemoving =
                          removing?.bookId === item.bookId && removing?.quoteIndex === item.quoteIndex;

                        return (
                          <li key={key} className="rounded-xl border border-gray-200 p-3 hover:bg-gray-50">
                            <div className="flex items-start justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(item.quote.text);
                                  toast.success("Copied!");
                                }}
                                className="text-left flex-1"
                              >
                                <div className="text-xs font-black text-gray-600">
                                  Page {item.quote.page}
                                  {expired ? (
                                  <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-700">
                                    expired
                                  </span>
                                ) : (
                                  <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                                    active
                                  </span>
                                )}
                                </div>

                                <div className="mt-1 text-sm text-gray-900">{item.quote.text}</div>
                                <div className="mt-2 text-[11px] font-black text-gray-500">Tap to copy</div>
                              </button>

                              <button
                                type="button"
                                onClick={() => removeQuote(item.bookId, item.quoteIndex)}
                                disabled={isRemoving}
                                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-black text-white hover:bg-red-700 disabled:opacity-60"
                              >
                                {isRemoving ? "Removing…" : "Remove"}
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}