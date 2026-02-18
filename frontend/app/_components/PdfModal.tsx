"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type PdfFeatures = {
  enableBookmarks?: boolean;
  enableQuotes?: boolean;
  enableLastPosition?: boolean;
};

export interface PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;

  features?: PdfFeatures;

  initialLastPosition?: { page?: number; scrollTop?: number };
  onSaveLastPosition?: (pos: { page: number; scrollTop: number }) => void;
  onCreateBookmark?: (payload: { page: number; text: string }) => void;
  onCreateQuote?: (payload: { page: number; text: string }) => void;
}

const BASE_RENDER_SCALE = 0.85;

const MIN_UI_ZOOM = 70;
const MAX_UI_ZOOM = 140;
const STEP = 5;

const ZOOM_DEBOUNCE_MS = 140;

const CANVAS_WINDOW_PAGES = 8; 
const TEXT_WINDOW_PAGES = 4;

const VIEW_PADDING = 6; 
const MAX_PAGE_WIDTH = 1800;

export default function PdfModal({
  isOpen,
  onClose,
  pdfUrl,
  title,
  features,
  initialLastPosition,
  onSaveLastPosition,
  onCreateBookmark,
  onCreateQuote,
}: PdfModalProps) {
  const [mounted, setMounted] = useState(false);

  const [numPages, setNumPages] = useState(0);
  const [docLoading, setDocLoading] = useState(true);
  const [docError, setDocError] = useState("");
  const [uiZoom, setUiZoom] = useState(100);
  const [appliedZoom, setAppliedZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  const [isFastScrolling, setIsFastScrolling] = useState(false);
  const scrollIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pageHeightsRef = useRef<Record<number, number>>({});
  const [pageAspect, setPageAspect] = useState<number>(1.3);
  const [pageWidth, setPageWidth] = useState(1100);

  const opts = {
    enableBookmarks: !!features?.enableBookmarks,
    enableQuotes: !!features?.enableQuotes,
    enableLastPosition: !!features?.enableLastPosition,
  };

  useEffect(() => {
    const t = setTimeout(() => setAppliedZoom(uiZoom), ZOOM_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [uiZoom]);

  const zoomScale = useMemo(() => {
    return BASE_RENDER_SCALE * (appliedZoom / 100);
  }, [appliedZoom]);

  const canvasRange = useMemo(() => {
    const start = Math.max(1, currentPage - CANVAS_WINDOW_PAGES);
    const end = Math.min(numPages || 1, currentPage + CANVAS_WINDOW_PAGES);
    return { start, end };
  }, [currentPage, numPages]);

  const textRange = useMemo(() => {
    const start = Math.max(1, currentPage - TEXT_WINDOW_PAGES);
    const end = Math.min(numPages || 1, currentPage + TEXT_WINDOW_PAGES);
    return { start, end };
  }, [currentPage, numPages]);

  const estimatedPageHeight = useMemo(() => {
    const renderedW = pageWidth * zoomScale;
    return Math.max(200, renderedW * pageAspect);
  }, [pageWidth, zoomScale, pageAspect]);

  const modalRoot = useMemo(() => {
    if (typeof window === "undefined") return null;
    let el = document.getElementById("modal-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "modal-root";
      document.body.appendChild(el);
    }
    return el;
  }, []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const el = contentRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth - VIEW_PADDING * 2;
      const clamped = Math.max(480, Math.min(MAX_PAGE_WIDTH, w));
      setPageWidth(clamped);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setDocLoading(true);
    setDocError("");
    setNumPages(0);
    setCurrentPage(1);

    setUiZoom(100);
    setAppliedZoom(100);

    setPageAspect(1.3);
    pageRefs.current = [];

    pageHeightsRef.current = {};
  }, [isOpen, pdfUrl]);

  const onLoadSuccess = async (pdf: PDFDocumentProxy) => {
    setNumPages(pdf.numPages);
    setDocLoading(false);
    setDocError("");

    try {
      const p1 = await pdf.getPage(1);
      const vp = p1.getViewport({ scale: 1 });
      setPageAspect(vp.height / vp.width);
    } catch {}

    if (opts.enableLastPosition && scrollRef.current) {
      const st = initialLastPosition?.scrollTop ?? 0;
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: st, behavior: "auto" });
      }, 50);
    }
  };

  const onLoadError = (err: any) => {
    setDocLoading(false);
    setDocError(err?.message || "Failed to load PDF");
  };

  useEffect(() => {
    if (!isOpen) return;
    if (!opts.enableLastPosition) return;
    if (!scrollRef.current) return;
    if (!onSaveLastPosition) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const scrollTop = scrollRef.current?.scrollTop ?? 0;
        onSaveLastPosition({ page: currentPage, scrollTop });
      });
    };

    const el = scrollRef.current;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isOpen, opts.enableLastPosition, onSaveLastPosition, currentPage]);

  useEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      setIsFastScrolling(true);
      if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current);
      scrollIdleTimer.current = setTimeout(() => setIsFastScrolling(false), 200);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!scrollRef.current) return;
    if (!numPages) return;

    const rootEl = scrollRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { page: number; ratio: number } | null = null;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const pageStr = (entry.target as HTMLElement).dataset.page;
          const page = pageStr ? parseInt(pageStr, 10) : NaN;
          if (!page || Number.isNaN(page)) continue;

          const ratio = entry.intersectionRatio;
          if (!best || ratio > best.ratio) best = { page, ratio };
        }

        if (best) setCurrentPage(best.page);
      },
      { root: rootEl, threshold: [0.2, 0.35, 0.5, 0.65, 0.8] }
    );

    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [isOpen, numPages]);

  const getSelectedText = () => (window.getSelection()?.toString() || "").trim();

  const handleBookmark = () => {
    const text = getSelectedText();
    if (!text) return;
    onCreateBookmark?.({ page: currentPage, text });
  };

  const handleQuote = () => {
    const text = getSelectedText();
    if (!text) return;
    onCreateQuote?.({ page: currentPage, text });
  };

  const zoomOut = () => setUiZoom((z) => Math.max(MIN_UI_ZOOM, z - STEP));
  const zoomIn = () => setUiZoom((z) => Math.min(MAX_UI_ZOOM, z + STEP));

  if (!isOpen || !mounted || !modalRoot) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483647] bg-black/60 flex items-center justify-center p-2 sm:p-3"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-[99vw] max-w-[99vw] h-[98vh] rounded-xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b">
          <div className="text-sm font-bold text-slate-800 truncate">
            {title || "PDF Viewer"} {numPages ? `(Page: ${currentPage}/${numPages})` : ""}
          </div>

          <div className="flex items-center gap-2">
            <button
              className="h-9 w-9 rounded-md border border-slate-300 bg-white text-slate-900 font-black hover:bg-slate-50 disabled:opacity-50"
              onClick={zoomOut}
              disabled={uiZoom <= MIN_UI_ZOOM}
              aria-label="Zoom out"
              title="Zoom out"
            >
              −
            </button>

            <div className="text-xs font-extrabold text-slate-800 w-16 text-center">
              {uiZoom}%
            </div>

            <button
              className="h-9 w-9 rounded-md border border-slate-300 bg-white text-slate-900 font-black hover:bg-slate-50 disabled:opacity-50"
              onClick={zoomIn}
              disabled={uiZoom >= MAX_UI_ZOOM}
              aria-label="Zoom in"
              title="Zoom in"
            >
              +
            </button>

            <button
              onClick={onClose}
              className="h-9 w-9 rounded-md border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-900 text-lg font-black"
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tools row (only if enabled) */}
        {(opts.enableBookmarks || opts.enableQuotes) && (
          <div className="h-12 flex items-center gap-2 px-4 border-b bg-slate-50">
            {opts.enableBookmarks && (
              <button
                onClick={handleBookmark}
                className="text-xs font-bold px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                + Bookmark
              </button>
            )}
            {opts.enableQuotes && (
              <button
                onClick={handleQuote}
                className="text-xs font-bold px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
              >
                + Quote
              </button>
            )}
            <div className="text-xs text-slate-500">Select text, then click Bookmark/Quote.</div>
          </div>
        )}

        {/* Scroll area */}
        <div ref={contentRef} className="flex-1 overflow-hidden">
          <div ref={scrollRef} className="h-full overflow-auto p-1 sm:p-2 bg-white">
            {docLoading && (
              <div className="h-full w-full flex items-center justify-center text-sm text-slate-600">
                Loading PDF...
              </div>
            )}

            {docError && (
              <div className="p-4 text-sm text-red-600">
                {docError}
                <div className="text-xs text-slate-500 mt-1">
                  Ensure backend serves /uploads and CORS allows your frontend.
                </div>
              </div>
            )}

            {!docError && (
              <Document file={pdfUrl} onLoadSuccess={onLoadSuccess} onLoadError={onLoadError} loading="">
                {Array.from({ length: numPages }, (_, idx) => {
                  const page = idx + 1;

                  const shouldRenderCanvas = page >= canvasRange.start && page <= canvasRange.end;
                  const shouldRenderText = page >= textRange.start && page <= textRange.end;

                  const measuredH = pageHeightsRef.current[page];
                  const placeholderH = measuredH ?? estimatedPageHeight;

                  return (
                    <div
                      key={`page_${page}`}
                      ref={(el) => {
                        pageRefs.current[idx] = el;
                      }}
                      data-page={page}
                      className="mb-3 flex justify-center"
                      style={!shouldRenderCanvas ? { height: placeholderH } : undefined}
                    >
                      {shouldRenderCanvas ? (
                        <Page
                          pageNumber={page}
                          width={pageWidth}
                          scale={zoomScale}
                          renderAnnotationLayer={false}
                          renderMode="canvas"
                          renderTextLayer={shouldRenderText}
                          devicePixelRatio={Math.min(
                            1.5,
                            typeof window !== "undefined" ? window.devicePixelRatio : 1
                          )}
                          loading={
                            <div className="w-full flex items-center justify-center text-xs text-slate-500 py-10">
                              Rendering page {page}...
                            </div>
                          }
                          onRenderSuccess={() => {
                            const el = pageRefs.current[idx];
                            if (!el) return;
                            const h = el.getBoundingClientRect().height;
                            if (h > 0) pageHeightsRef.current[page] = h;
                          }}
                        />
                      ) : (
                        <div className="w-full" />
                      )}
                    </div>
                  );
                })}
              </Document>
            )}
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  );
}
