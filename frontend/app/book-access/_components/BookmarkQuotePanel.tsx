"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { handleAddBookmark, handleAddQuote } from "@/lib/actions/book-access-action";

interface TextSelection {
  start: number;
  end: number;
}

interface BookmarkQuotePanelProps {
  bookId: string;
  currentPage: number;
  selectedText: string;
  selectedSelection?: TextSelection; // ADDED
  enableBookmarks?: boolean;
  enableQuotes?: boolean;
  onAdded?: () => void;
}

export default function BookmarkQuotePanel({
  bookId,
  currentPage,
  selectedText,
  selectedSelection,
  enableBookmarks = true,
  enableQuotes = true,
  onAdded,
}: BookmarkQuotePanelProps) {
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);

  const handleBookmark = async () => {
    if (!selectedText) return toast.error("Please select text to bookmark.");

    setLoadingBookmark(true);
    try {
      const result = await handleAddBookmark(bookId, {
        page: currentPage,
        text: selectedText,
        selection: selectedSelection,
      });

      if (result.success) {
        toast.success("Bookmark added!");
        onAdded?.();
      } else {
        toast.error(result.message || "Failed to add bookmark");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add bookmark");
    } finally {
      setLoadingBookmark(false);
    }
  };

  const handleQuote = async () => {
    if (!selectedText) return toast.error("Please select text to quote.");

    setLoadingQuote(true);
    try {
      const result = await handleAddQuote(bookId, {
        page: currentPage,
        text: selectedText,
        selection: selectedSelection,
      });

      if (result.success) {
        toast.success("Quote added!");
        onAdded?.();
      } else {
        toast.error(result.message || "Failed to add quote");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add quote");
    } finally {
      setLoadingQuote(false);
    }
  };

  if (!selectedText) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9500] flex gap-2 p-3 bg-white shadow-lg rounded-lg border border-gray-200">
      {enableBookmarks && (
        <button
          onClick={handleBookmark}
          disabled={loadingBookmark}
          className="px-3 py-2 text-sm font-bold bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loadingBookmark ? "Adding..." : "+ Bookmark"}
        </button>
      )}

      {enableQuotes && (
        <button
          onClick={handleQuote}
          disabled={loadingQuote}
          className="px-3 py-2 text-sm font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          {loadingQuote ? "Adding..." : "+ Quote"}
        </button>
      )}
    </div>
  );
}
