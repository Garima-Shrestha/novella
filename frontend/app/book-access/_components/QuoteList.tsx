"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { handleRemoveQuote } from "@/lib/actions/book-access-action";

interface TextSelection {
  start: number;
  end: number;
}

interface Quote {
  page: number;
  text: string;
  selection?: TextSelection;
}

export default function QuoteList({
  bookId,
  quotes,
  setQuotes,
  onNavigate,
}: {
  bookId: string;
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  onNavigate?: (payload: { kind: "quote"; page: number; text: string; selection?: TextSelection }) => void;
}) {
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  const removeQuote = async (index: number) => {
    setRemovingIndex(index);
    try {
      const result = await handleRemoveQuote(bookId, index);
      if (result.success) {
        toast.success("Quote removed");
        setQuotes((prev) => prev.filter((_, i) => i !== index));
      } else {
        toast.error(result.message || "Failed to remove quote");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to remove quote");
    } finally {
      setRemovingIndex(null);
    }
  };

  if (!quotes.length) return <div className="p-4 text-gray-500">No quotes yet.</div>;

  return (
    <div className="p-2 bg-white rounded">
      <h3 className="text-sm font-extrabold text-black mb-3">Quotes</h3>
      <ul className="space-y-2">
        {quotes.map((quote, idx) => (
          <li key={idx} className="flex justify-between items-start p-2 border rounded hover:bg-gray-50">
            <button
              type="button"
              onClick={() => onNavigate?.({ kind: "quote", page: quote.page, text: quote.text, selection: quote.selection })}
              className="text-left flex-1 pr-3"
            >
              <div className="text-xs text-gray-600 font-bold">Page {quote.page}</div>
              <div className="text-gray-800 text-sm">{quote.text}</div>
              {false && !quote.selection && (
                <div className="mt-1 text-[11px] text-amber-700 font-bold">
                  (Old quote: no selection saved, highlight/jump uses text match)
                </div>
              )}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(quote.text);
                  toast.success("Copied to clipboard!");
                }}
                className="px-2 py-1 text-xs bg-gray-300 text-gray-800 rounded hover:bg-gray-400 font-bold"
              >
                Copy
              </button>
              <button
                onClick={() => removeQuote(idx)}
                disabled={removingIndex === idx}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-bold"
              >
                {removingIndex === idx ? "Removing..." : "Remove"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
