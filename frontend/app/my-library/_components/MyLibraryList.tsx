"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

export default function MyLibraryList({
  items,
  pagination,
}: {
  items: any[];
  pagination: any;
}) {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const size = pagination?.size || 10;

  const currentHref = useMemo(
    () => `/my-library?page=${currentPage}&size=${size}`,
    [currentPage, size]
  );

  const prevHref = useMemo(
    () => `/my-library?page=${Math.max(1, currentPage - 1)}&size=${size}`,
    [currentPage, size]
  );

  const nextHref = useMemo(
    () => `/my-library?page=${Math.min(totalPages, currentPage + 1)}&size=${size}`,
    [currentPage, totalPages, size]
  );

  const lastRefreshRef = useRef(0);

  useEffect(() => {
    const hardRefresh = () => {
      const now = Date.now();
      if (now - lastRefreshRef.current < 600) return;
      lastRefreshRef.current = now;
      router.refresh();
      router.replace(currentHref);
    };

    const shouldRefresh = () => {
      try {
        return sessionStorage.getItem("LIB_REFRESH") === "1";
      } catch {
        return false;
      }
    };

    const clearRefreshFlag = () => {
      try {
        sessionStorage.removeItem("LIB_REFRESH");
      } catch {
        // ignore
      }
    };

    const safeRefreshIfNeeded = () => {
      if (shouldRefresh()) {
        clearRefreshFlag();
        hardRefresh();
      }
    };

    const onPageShow = () => {
      safeRefreshIfNeeded();
    };

    const onVisibilityChange = () => {
      if (!document.hidden) safeRefreshIfNeeded();
    };

    const onFocus = () => safeRefreshIfNeeded();
    const onPopState = () => safeRefreshIfNeeded();

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    window.addEventListener("popstate", onPopState);

    safeRefreshIfNeeded();

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("popstate", onPopState);
    };
  }, [router, currentHref]);

  const setRefreshFlag = () => {
    try {
      sessionStorage.setItem("LIB_REFRESH", "1");
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-white font-sans">
      <div className="max-w-4xl mx-auto px-4 py-5">
        <div className="mb-3">
          <h1 className="text-[18px] font-black text-black">My Library</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Your rented books and reading progress.
          </p>
        </div>

        <div className="space-y-3">
          {items?.map((item: any) => {
            const cover = item?.coverImageUrl
              ? item.coverImageUrl.startsWith("http")
                ? item.coverImageUrl
                : `${BASE_URL}${item.coverImageUrl}`
              : "";

            const isExpired = !!item?.isExpired;
            const isInactive = !!item?.isInactive;
            const blocked = isExpired || isInactive; 

            const cardHref = blocked
            ? `/books-before-renting/${item.bookId}`
            : `/book-access/${item.bookId}`;

            const progress = Math.max(
              0,
              Math.min(100, Number(item?.progressPercent ?? 0))
            );

            return (
              <div
                key={item.accessId || item.bookId}
                className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm"
              >
                <Link
                  href={cardHref}
                  prefetch={false}
                  className="block"
                  onClick={() => {
                    if (!blocked) setRefreshFlag();
                  }}
                >
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

                        <div className="shrink-0">
                          {isExpired ? (
                            <span className="text-[10px] font-black px-3 py-1 rounded-full border border-red-200 bg-red-50 text-red-700">
                                Expired
                            </span>
                            ) : isInactive ? (
                            <span className="text-[10px] font-black px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                                Inactive
                            </span>
                            ) : (
                            <span className="text-[10px] font-black px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                                Active
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-700 font-semibold">
                        {item?.pages || 0} Pages
                      </div>

                      <div className="mt-1.5 flex items-center justify-between">
                        <div className="text-[11px] text-slate-800 font-semibold">
                          Progress:{" "}
                          <span className="font-black text-slate-900">
                            {progress}%
                          </span>
                        </div>

                        <div className="text-[11px] font-bold text-slate-700">
                          {item?.timeLeftLabel || ""}
                        </div>
                      </div>

                      <div className="mt-3 w-full h-[8px] bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>

                {item?.canReRent && (
                  <div className="mt-2 flex justify-end">
                    <Link
                      href={`/books-before-renting/${item.bookId}`}
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
              No rented books found.
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