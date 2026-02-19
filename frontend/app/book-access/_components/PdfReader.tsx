"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { updateLastPosition } from "@/lib/api/book-access";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface TextSelection {
  start: number;
  end: number;
}

interface QuoteItem {
  page: number;
  text: string;
  selection?: TextSelection;
}

interface BookmarkItem {
  page: number;
  text: string;
  selection?: TextSelection;
}

interface LastPosition {
  page?: number;
  offsetY?: number;
  zoom?: number;
}

interface PdfReaderProps {
  pdfUrl: string;
  bookId: string;

  enableBookmarks?: boolean;
  enableQuotes?: boolean;
  enableLastPosition?: boolean;

  isLocked?: boolean;

  onOpenDrawer?: () => void;
  onPageChange?: (page: number) => void;
  onSelectionChange?: (text: string) => void;

  onAddBookmark?: (payload: {
    page: number;
    text: string;
    selection?: TextSelection;
  }) => void;

  onAddQuote?: (payload: {
    page: number;
    text: string;
    selection?: TextSelection;
  }) => void;

  quotes?: QuoteItem[];
  bookmarks?: BookmarkItem[];
  initialLastPosition?: LastPosition;

  jumpRequest?: {
    kind: "bookmark" | "quote";
    page: number;
    text: string;
    selection?: TextSelection;
  } | null;

  onJumpHandled?: () => void;
}

interface SelectionRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface SelectionUI {
  text: string;
  rect: SelectionRect | null;
  selection?: TextSelection;
}

function getPageRootEl(page: number) {
  return document.querySelector(
    `.react-pdf__Page[data-page-number="${page}"]`
  ) as HTMLElement | null;
}

function getTextLayerEl(page: number) {
  const root = getPageRootEl(page);
  if (!root) return null;
  return root.querySelector(".react-pdf__Page__textContent") as HTMLElement | null;
}

function unwrapHighlights(textLayerEl: HTMLElement, dataKey: string) {
  const nodes = textLayerEl.querySelectorAll(`[data-hl="${dataKey}"]`);
  nodes.forEach((n) => {
    const el = n as HTMLElement;
    const parent = el.parentNode;
    if (!parent) return;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  });
}

function applyHighlightByOffsets(
  textLayerEl: HTMLElement,
  start: number,
  end: number,
  dataKey: string,
  className: string
) {
  if (end <= start) return;

  unwrapHighlights(textLayerEl, dataKey);

  const walker = document.createTreeWalker(textLayerEl, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  let pos = 0;

  while (node) {
    const text = node.nodeValue || "";
    const len = text.length;

    const nodeStart = pos;
    const nodeEnd = pos + len;

    const overlapStart = Math.max(start, nodeStart);
    const overlapEnd = Math.min(end, nodeEnd);

    if (overlapEnd > overlapStart) {
      const localStart = overlapStart - nodeStart;
      const localEnd = overlapEnd - nodeStart;

      const mid = node.splitText(localStart);
      const after = mid.splitText(localEnd - localStart);

      const wrapper = document.createElement("span");
      wrapper.setAttribute("data-hl", dataKey);
      wrapper.className = className;

      const parent = mid.parentNode;
      if (parent) {
        parent.insertBefore(wrapper, mid);
        wrapper.appendChild(mid);
      }

      node = after;
      pos = nodeStart + localEnd; 
      continue;
    }

    pos += len;
    node = walker.nextNode() as Text | null;
  }
}

function captureOffsetsInTextLayer(range: Range, textLayerEl: HTMLElement) {
  const pre = document.createRange();
  pre.selectNodeContents(textLayerEl);
  pre.setEnd(range.startContainer, range.startOffset);
  const start = pre.toString().length;

  const pre2 = document.createRange();
  pre2.selectNodeContents(textLayerEl);
  pre2.setEnd(range.endContainer, range.endOffset);
  const end = pre2.toString().length;

  if (end > start) return { start, end };
  return undefined;
}

export default function PdfReader({
  pdfUrl,
  bookId,
  enableBookmarks = true,
  enableQuotes = true,
  enableLastPosition = true,
  isLocked = false,
  onOpenDrawer,
  onPageChange,
  onSelectionChange,
  onAddBookmark,
  onAddQuote,
  quotes = [],
  bookmarks = [],
  initialLastPosition,
  jumpRequest,
  onJumpHandled,
}: PdfReaderProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [zoom, setZoom] = useState(100);
  const [appliedZoom, setAppliedZoom] = useState(100);

  const [selectionUI, setSelectionUI] = useState<SelectionUI>({
    text: "",
    rect: null,
    selection: undefined,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);

  const BASE_SCALE = 0.85;
  const ZOOM_STEP = 5;
  const MIN_ZOOM = 70;
  const MAX_ZOOM = 140;
  const ZOOM_DEBOUNCE_MS = 140;

  useEffect(() => {
    const t = setTimeout(() => setAppliedZoom(zoom), ZOOM_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [zoom]);

  const zoomScale = useMemo(() => BASE_SCALE * (appliedZoom / 100), [appliedZoom]);

  const onLoadSuccess = (pdf: any) => {
    setNumPages(pdf.numPages || 0);
  };

  useEffect(() => {
    if (!enableLastPosition) return;
    if (isLocked) return;
    if (!initialLastPosition) return;

    const desiredZoom = initialLastPosition.zoom || 100;
    if (desiredZoom !== zoom) {
      setZoom(desiredZoom);
    }

  }, [enableLastPosition, isLocked, initialLastPosition]);

  useEffect(() => {
    if (!enableLastPosition) return;
    if (isLocked) return;
    if (!initialLastPosition) return;
    if (!scrollRef.current) return;
    if (!numPages) return;

    const desiredOffset = initialLastPosition.offsetY || 0;

    const t = setTimeout(() => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollTop = desiredOffset;
    }, 180);

    return () => clearTimeout(t);
  }, [enableLastPosition, isLocked, initialLastPosition, numPages, appliedZoom]);

  useEffect(() => {
    if (!scrollRef.current) return;
    if (!numPages) return;

    const rootEl = scrollRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestPage = currentPage;
        let bestRatio = 0;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const pageStr = (entry.target as HTMLElement).dataset.page;
          const page = pageStr ? parseInt(pageStr, 10) : NaN;
          if (!page || Number.isNaN(page)) continue;

          const ratio = entry.intersectionRatio;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestPage = page;
          }
        }

        if (bestPage !== currentPage) {
          setCurrentPage(bestPage);
          onPageChange?.(bestPage);
        }
      },
      { root: rootEl, threshold: [0.2, 0.35, 0.5, 0.65, 0.8] }
    );

    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [numPages]);

  useEffect(() => {
    if (!enableLastPosition) return;
    if (isLocked) return;
    if (!scrollRef.current) return;

    const el = scrollRef.current;

    let raf = 0;
    let lastSent = 0;

    const onScroll = () => {
      const now = Date.now();
      if (now - lastSent < 500) return;
      lastSent = now;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(async () => {
        try {
          await updateLastPosition(bookId, {
            page: currentPage,
            offsetY: el.scrollTop,
            zoom: zoom,
          });
        } catch {
          // ignore
        }
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [enableLastPosition, isLocked, bookId, currentPage, zoom]);

  const captureSelection = useCallback(() => {
    if (isLocked) {
      setSelectionUI({ text: "", rect: null, selection: undefined });
      onSelectionChange?.("");
      return;
    }

    const sel = window.getSelection();
    const text = (sel?.toString() || "").trim();

    if (!sel || !text || sel.rangeCount === 0) {
      setSelectionUI({ text: "", rect: null, selection: undefined });
      onSelectionChange?.("");
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const okRect = rect && rect.width > 2 && rect.height > 2;

    let selection: TextSelection | undefined = undefined;
    const textLayerEl = getTextLayerEl(currentPage);
    if (textLayerEl && textLayerEl.contains(range.startContainer) && textLayerEl.contains(range.endContainer)) {
      selection = captureOffsetsInTextLayer(range, textLayerEl);
    }

    setSelectionUI({
      text,
      rect: okRect
        ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        : null,
      selection,
    });

    onSelectionChange?.(text);
  }, [isLocked, onSelectionChange, currentPage]);

  useEffect(() => {
    const onMouseUp = () => requestAnimationFrame(captureSelection);
    const onTouchEnd = () => setTimeout(captureSelection, 0);

    document.addEventListener("selectionchange", captureSelection);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("selectionchange", captureSelection);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchend", onTouchEnd as any);
    };
  }, [captureSelection]);

  const applyPersistentHighlightsForPage = useCallback(
    (page: number) => {
      const textLayerEl = getTextLayerEl(page);
      if (!textLayerEl) return;

      unwrapHighlights(textLayerEl, "quote");

      const pageQuotes = quotes.filter((q) => q.page === page && q.selection);
      pageQuotes.forEach((q) => {
        if (!q.selection) return;
        applyHighlightByOffsets(
          textLayerEl,
          q.selection.start,
          q.selection.end,
          "quote",
          "bg-emerald-200/45 rounded-sm px-0.5"
        );
      });
    },
    [quotes]
  );

  useEffect(() => {
    if (!numPages) return;
    const pages = [currentPage - 1, currentPage, currentPage + 1].filter(
      (p) => p >= 1 && p <= numPages
    );

    const t = setTimeout(() => {
      pages.forEach((p) => applyPersistentHighlightsForPage(p));
    }, 120);

    return () => clearTimeout(t);
  }, [numPages, currentPage, appliedZoom, applyPersistentHighlightsForPage]);

  useEffect(() => {
    if (!jumpRequest) return;
    if (!numPages) return;

    const targetPage = jumpRequest.page;

    const doJump = async () => {
      const pageEl = pageRefs.current[targetPage - 1];
      if (pageEl) {
        pageEl.scrollIntoView({ block: "start", behavior: "smooth" });
      }

      const tries = 24;
      let i = 0;

      const timer = setInterval(() => {
        i += 1;
        const textLayerEl = getTextLayerEl(targetPage);
        if (!textLayerEl) {
          if (i >= tries) {
            clearInterval(timer);
            onJumpHandled?.();
          }
          return;
        }

        applyPersistentHighlightsForPage(targetPage);
        unwrapHighlights(textLayerEl, "temp");

        const tempClass =
          jumpRequest.kind === "quote"
            ? "bg-emerald-200/45 rounded-sm px-0.5"  
            : "bg-yellow-200/65 rounded-sm px-0.5";  

        if (jumpRequest.selection) {
          applyHighlightByOffsets(
            textLayerEl,
            jumpRequest.selection.start,
            jumpRequest.selection.end,
            "temp",
            tempClass
          );

          const first = textLayerEl.querySelector('[data-hl="temp"]') as HTMLElement | null;
          if (first) {
            first.scrollIntoView({ block: "center", behavior: "smooth" });
          }
        } else {
          const needle = (jumpRequest.text || "").trim();
          if (needle) {
            const full = textLayerEl.innerText || "";
            const idx = full.indexOf(needle);
            if (idx >= 0) {
              applyHighlightByOffsets(
                textLayerEl,
                idx,
                idx + needle.length,
                "temp",
                tempClass
              );
              const first = textLayerEl.querySelector('[data-hl="temp"]') as HTMLElement | null;
              if (first) first.scrollIntoView({ block: "center", behavior: "smooth" });
            }
          }
        }

        clearInterval(timer);

        const ms = jumpRequest.kind === "bookmark" ? 2500 : 1800;
        setTimeout(() => {
          const tl = getTextLayerEl(targetPage);
          if (tl) unwrapHighlights(tl, "temp");
        }, ms);

        onJumpHandled?.();
      }, 120);
    };

    doJump();
  }, [
    jumpRequest,
    numPages,
    onJumpHandled,
    applyPersistentHighlightsForPage,
  ]);

  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));

  const selectedText = selectionUI.text;

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-[999]">
        <div className="mx-2 mt-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-black text-black">
              Page {currentPage} / {numPages || "…"}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                disabled={zoom <= MIN_ZOOM || isLocked}
                className="h-9 w-9 rounded-lg border border-gray-300 bg-white text-black font-black hover:bg-gray-50 disabled:opacity-40"
                title="Zoom out"
              >
                −
              </button>

              <div className="min-w-[64px] text-center text-sm font-black text-black">
                {zoom}%
              </div>

              <button
                onClick={zoomIn}
                disabled={zoom >= MAX_ZOOM || isLocked}
                className="h-9 w-9 rounded-lg border border-gray-300 bg-white text-black font-black hover:bg-gray-50 disabled:opacity-40"
                title="Zoom in"
              >
                +
              </button>

              <button
                type="button"
                onClick={onOpenDrawer}
                className="h-9 w-9 rounded-lg border border-gray-300 bg-white text-black font-black hover:bg-gray-50"
                title="Menu"
                aria-label="Menu"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectionUI.rect &&
        !isLocked &&
        selectedText &&
        (enableBookmarks || enableQuotes) && (
          <div
            className="fixed z-[1000]"
            style={{
              top: selectionUI.rect.top - 10,
              left: selectionUI.rect.left + selectionUI.rect.width / 2,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="rounded-xl border border-gray-200 bg-white shadow-lg px-2 py-2 flex items-center gap-2">
              {enableBookmarks && (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    onAddBookmark?.({
                      page: currentPage,
                      text: selectedText,
                      selection: selectionUI.selection,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-black text-sm hover:bg-blue-700"
                >
                  + Bookmark
                </button>
              )}

              {enableQuotes && (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    onAddQuote?.({
                      page: currentPage,
                      text: selectedText,
                      selection: selectionUI.selection,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700"
                >
                  + Quote
                </button>
              )}
            </div>
          </div>
        )}

      <div
        ref={scrollRef}
        className="absolute inset-0 pt-16 overflow-auto"
        style={{
          pointerEvents: isLocked ? "none" : "auto",
          userSelect: isLocked ? "none" : "text",
        }}
      >
        <div className="p-3">
          <Document file={pdfUrl} onLoadSuccess={onLoadSuccess} loading="">
            {Array.from({ length: numPages }, (_, idx) => {
              const page = idx + 1;
              return (
                <div
                  key={page}
                  ref={(el) => {
                    pageRefs.current[idx] = el;
                  }}
                  data-page={page}
                  className="mb-4 flex justify-center"
                >
                  <Page
                    pageNumber={page}
                    width={1000}
                    scale={zoomScale}
                    renderAnnotationLayer={false}
                    loading={
                      <div className="py-4 text-sm text-gray-500">
                        Rendering page {page}...
                      </div>
                    }
                  />
                </div>
              );
            })}
          </Document>
        </div>
      </div>

      {isLocked && (
        <div className="absolute inset-0 z-[998] flex items-center justify-center bg-white/80">
          <div className="max-w-md mx-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg text-center">
            <div className="text-lg font-black text-black">Reading access expired</div>
            <div className="mt-2 text-sm text-gray-700">
              The PDF is locked. Your quotes remain visible in the menu.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
