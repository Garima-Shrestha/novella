"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { handleRemoveBookmark } from "@/lib/actions/book-access-action";

interface TextSelection {
  start: number;
  end: number;
}

interface Bookmark {
  page: number;
  text: string;
  selection?: TextSelection;
}

export default function BookmarkList({
  bookId,
  bookmarks,
  setBookmarks,
  onNavigate,
}: {
  bookId: string;
  bookmarks: Bookmark[];
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
  onNavigate?: (payload: { kind: "bookmark"; page: number; text: string; selection?: TextSelection }) => void;
}) {
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  const removeBookmark = async (index: number) => {
    setRemovingIndex(index);
    try {
      const result = await handleRemoveBookmark(bookId, index);
      if (result.success) {
        toast.success("Bookmark removed");
        setBookmarks((prev) => prev.filter((_, i) => i !== index));
      } else {
        toast.error(result.message || "Failed to remove bookmark");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to remove bookmark");
    } finally {
      setRemovingIndex(null);
    }
  };

  if (!bookmarks.length) return <div className="p-4 text-gray-500">No bookmarks yet.</div>;

  return (
    <div className="p-2 bg-white rounded">
      <h3 className="text-sm font-extrabold text-black mb-3">Bookmarks</h3>

      <ul className="space-y-2">
        {bookmarks.map((b, idx) => (
          <li key={idx} className="flex justify-between items-start p-2 border rounded hover:bg-gray-50">
            <button
              type="button"
              onClick={() => onNavigate?.({ kind: "bookmark", page: b.page, text: b.text, selection: b.selection })}
              className="text-left flex-1 pr-3"
            >
              <div className="text-xs text-gray-600 font-bold">Page {b.page}</div>
              <div className="text-gray-800 text-sm">{b.text}</div>

              {/* OPTIONAL: hide this message if you don’t want it */}
              {false && !b.selection && (
                <div className="mt-1 text-[11px] text-amber-700 font-bold">
                  (Old bookmark: no selection saved, jump uses text match)
                </div>
              )}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(b.text);
                  toast.success("Copied to clipboard!");
                }}
                className="px-2 py-1 text-xs bg-gray-300 text-gray-800 rounded hover:bg-gray-400 font-bold"
              >
                Copy
              </button>

              <button
                onClick={() => removeBookmark(idx)}
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
