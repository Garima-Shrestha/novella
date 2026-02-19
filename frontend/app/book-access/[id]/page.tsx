"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

import BookmarkList from "../_components/BookmarkList";
import QuoteList from "../_components/QuoteList";

import {
  handleFetchMyBookAccessByBook,
  handleAddBookmark,
  handleAddQuote,
} from "@/lib/actions/book-access-action";

const PdfReader = dynamic(() => import("../_components/PdfReader"), { ssr: false });

interface TextSelection {
  start: number;
  end: number;
}

interface LastPosition {
  page?: number;
  offsetY?: number;
  zoom?: number;
}

interface Bookmark {
  page: number;
  text: string;
  selection?: TextSelection;
}

interface Quote {
  page: number;
  text: string;
  selection?: TextSelection;
}

interface BookAccessData {
  pdfUrl?: string;
  expiresAt?: string;
  isActive?: boolean;
  lastPosition?: LastPosition;
  bookmarks?: Bookmark[];
  quotes?: Quote[];
}

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

export default function BookAccessPage() {
  const params = useParams();
  const bookId = params?.id as string;

  const [access, setAccess] = useState<BookAccessData | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState("bookmarks"); 
  const [refreshKey, setRefreshKey] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedText, setSelectedText] = useState("");

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const [jumpRequest, setJumpRequest] = useState<{
    kind: "bookmark" | "quote";
    page: number;
    text: string;
    selection?: TextSelection;
  } | null>(null);

  const BASE_URL = "http://localhost:5050";

  // useEffect(() => {
  //   const fetchAccess = async () => {
  //     try {
  //       const result = await handleFetchMyBookAccessByBook(bookId);
  //       if (!result.success) {
  //         toast.error(result.message || "Failed to fetch book access");
  //         return;
  //       }

  //       const data = result.data as BookAccessData;
  //       setAccess(data);

  //       setQuotes(data?.quotes || []);
  //       setBookmarks(data?.bookmarks || []);

  //       const url = data?.pdfUrl;
  //       if (!url) {
  //         toast.error("No pdfUrl found for this rented book.");
  //         return;
  //       }

  //       setPdfUrl(url.startsWith("http") ? url : `${BASE_URL}${url}`);

  //       setCurrentPage(data?.lastPosition?.page || 1);
  //     } catch (err: any) {
  //       toast.error(err.message || "Failed to fetch book");
  //     }
  //   };

  //   if (bookId) fetchAccess();
  // }, [bookId, refreshKey]);


  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const result = await handleFetchMyBookAccessByBook(bookId);
        if (!result.success) {
          toast.error(result.message || "Failed to fetch book access");
          return;
        }

        const data = result.data as BookAccessData;

        setAccess(data);

        setQuotes(data?.quotes || []);
        setBookmarks(data?.bookmarks || []);

        const url = data?.pdfUrl;
        if (!url) {
          toast.error("No pdfUrl found for this rented book.");
          return;
        }

        setPdfUrl(url.startsWith("http") ? url : `${BASE_URL}${url}`);
        setCurrentPage(data?.lastPosition?.page || 1);
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch book");
      }
    };

    if (bookId) fetchAccess();
  }, [bookId]);


  useEffect(() => {
  const refreshListsOnly = async () => {
    try {
      const result = await handleFetchMyBookAccessByBook(bookId);
      if (!result.success) return;

      const data = result.data as BookAccessData;

      setQuotes(data?.quotes || []);
      setBookmarks(data?.bookmarks || []);
    } catch {
      // ignore
    }
  };

  if (bookId && refreshKey > 0) refreshListsOnly();
}, [bookId, refreshKey]);


  const isExpired = useMemo(() => {
    if (!access) return false;
    if (access.isActive === false) return true;
    if (!access.expiresAt) return false;

    const expMs = getExpiryMsFrontend(access.expiresAt);
    if (!expMs || Number.isNaN(expMs)) return false;

    return Date.now() > expMs;
  }, [access]);

  const canRead = !isExpired;
  const enableBookmarks = !isExpired;
  const enableQuotesCreate = !isExpired;
  const enableLastPosition = !isExpired;

  const onAddBookmark = async (payload: { page: number; text: string; selection?: TextSelection }) => {
    if (!enableBookmarks) return toast.error("Bookmarks are disabled because access has expired.");
    if (!payload.text) return toast.error("Select text first.");

    const res = await handleAddBookmark(bookId, {
      page: payload.page,
      text: payload.text,
      selection: payload.selection,
    });

    if (res.success) {
      toast.success("Bookmark added!");
      setRefreshKey((k) => k + 1);
    } else {
      toast.error(res.message || "Failed to add bookmark");
    }
  };

  const onAddQuote = async (payload: { page: number; text: string; selection?: TextSelection }) => {
    if (!enableQuotesCreate) return toast.error("Quotes are read-only because access has expired.");
    if (!payload.text) return toast.error("Select text first.");

    const res = await handleAddQuote(bookId, {
      page: payload.page,
      text: payload.text,
      selection: payload.selection,
    });

    if (res.success) {
      toast.success("Quote added!");
      setRefreshKey((k) => k + 1);
    } else {
      toast.error(res.message || "Failed to add quote");
    }
  };

  const onNavigate = (payload: {
    kind: "bookmark" | "quote";
    page: number;
    text: string;
    selection?: TextSelection;
  }) => {
    setDrawerOpen(false);
    setJumpRequest(payload);
  };

  if (!bookId || !pdfUrl) {
    return <div className="p-4 text-gray-500">Loading book...</div>;
  }

  return (
    <div className="relative w-full h-screen bg-white">
      <div className="absolute inset-0">
        <PdfReader
          pdfUrl={pdfUrl}
          bookId={bookId}
          isLocked={!canRead}
          enableBookmarks={enableBookmarks}
          enableQuotes={enableQuotesCreate}
          enableLastPosition={enableLastPosition}
          onPageChange={setCurrentPage}
          onSelectionChange={setSelectedText}
          onAddBookmark={onAddBookmark}
          onAddQuote={onAddQuote}
          onOpenDrawer={() => setDrawerOpen(true)}
          quotes={quotes}
          bookmarks={bookmarks}
          initialLastPosition={access?.lastPosition}
          jumpRequest={jumpRequest}
          onJumpHandled={() => setJumpRequest(null)}
        />
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-[1200] bg-black/40" onClick={() => setDrawerOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-[92vw] max-w-sm bg-white shadow-xl border-l flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-14 px-4 border-b flex items-center justify-between">
              <div className="font-black text-black">Menu</div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="h-9 w-9 rounded-lg border bg-white hover:bg-gray-50 font-black text-black"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b bg-gray-50">
              <div className="text-xs text-gray-700">
                Current page: <b className="text-black">{currentPage}</b>
              </div>

              {isExpired && (
                <div className="mt-2 text-xs font-black text-red-700">
                  Access expired: PDF locked, bookmarks disabled, quotes read-only.
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => onAddBookmark({ page: currentPage, text: selectedText })}
                  disabled={!selectedText || !enableBookmarks}
                  className="flex-1 px-3 py-2 rounded bg-blue-600 text-white font-black text-sm disabled:opacity-50"
                >
                  + Bookmark
                </button>

                <button
                  onClick={() => onAddQuote({ page: currentPage, text: selectedText })}
                  disabled={!selectedText || !enableQuotesCreate}
                  className="flex-1 px-3 py-2 rounded bg-emerald-600 text-white font-black text-sm disabled:opacity-50"
                >
                  + Quote
                </button>
              </div>

              {!selectedText && (
                <div className="mt-2 text-xs text-gray-600">
                  Select text in the PDF to enable actions.
                </div>
              )}
            </div>

            <div className="p-2 flex gap-2 border-b">
              <button
                onClick={() => setTab("bookmarks")}
                className={`flex-1 px-3 py-2 rounded font-black text-sm border ${
                  tab === "bookmarks"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-black border-gray-200"
                }`}
              >
                Bookmarks
              </button>

              <button
                onClick={() => setTab("quotes")}
                className={`flex-1 px-3 py-2 rounded font-black text-sm border ${
                  tab === "quotes"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-black border-gray-200"
                }`}
              >
                Quotes
              </button>
            </div>

            <div className="flex-1 overflow-auto p-3">
              {tab === "bookmarks" ? (
                <BookmarkList
                  bookId={bookId}
                  bookmarks={bookmarks}
                  setBookmarks={setBookmarks}
                  onNavigate={onNavigate}
                />
              ) : (
                <QuoteList
                  bookId={bookId}
                  quotes={quotes}
                  setQuotes={setQuotes}
                  onNavigate={onNavigate}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
