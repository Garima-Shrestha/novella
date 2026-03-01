"use client";
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { handleFetchAllBooks } from '@/lib/actions/books-before-renting-action';
import { handleFetchMyBookAccessByBook } from '@/lib/actions/book-access-action';
import { handleFetchMyLibrary } from '@/lib/actions/my-library-action';

interface BookResult {
  _id: string;
  title: string;
  author: string;
  coverImageUrl?: string;
}

interface ReadingNowItem {
  accessId: string;
  bookId: string;
  title: string;
  author: string;
  coverImageUrl?: string;
  progressPercent?: number;
  timeLeftLabel?: string;
  isExpired?: boolean;
  isInactive?: boolean;
}

export default function HomePage() {
  const categories = ['Fiction', 'Fantasy', 'Non Fiction', 'Children', 'History'];
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [navigating, setNavigating] = useState<string | null>(null);
  const [readingNow, setReadingNow] = useState<ReadingNowItem[]>([]);
  const [newArrivals, setNewArrivals] = useState<BookResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchReadingNow = async () => {
      try {
        const res = await handleFetchMyLibrary({ page: 1, size: 20 });
        if (res.success && Array.isArray(res.data)) {
          const active = (res.data as ReadingNowItem[]).filter(
            (item) => !item.isExpired && !item.isInactive
          );
          setReadingNow(active.slice(0, 4));
        }
      } catch {
        // silently fail. reading now is non-critical
      }
    };
    fetchReadingNow();
  }, []);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await handleFetchAllBooks();
        if (res.success && Array.isArray(res.data)) {
          const sorted = [...(res.data as BookResult[])].reverse();
          setNewArrivals(sorted.slice(0, 6));
        }
      } catch {
        // silently fail
      }
    };
    fetchNewArrivals();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await handleFetchAllBooks();
        if (res.success && Array.isArray(res.data)) {
          const filtered = (res.data as BookResult[]).filter((b) =>
            b.title.toLowerCase().includes(trimmed.toLowerCase())
          );
          setResults(filtered);
          setShowDropdown(true);
        } else {
          setResults([]);
          setShowDropdown(true);
        }
      } catch {
        setResults([]);
        setShowDropdown(true);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleBookClick = async (book: BookResult) => {
    setNavigating(book._id);
    setShowDropdown(false);
    setQuery('');
    try {
      const res = await handleFetchMyBookAccessByBook(book._id);
      if (res.success) {
        router.push(`/book-access/${book._id}`);
      } else {
        router.push(`/books-before-renting/${book._id}`);
      }
    } catch {
        router.push(`/books-before-renting/${book._id}`);
    } finally {
      setNavigating(null);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      <section className="mb-6">
        <div className="w-full max-w-xl" ref={wrapperRef}>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Discover your next read</h1>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {loading ? (
                <div className="w-5 h-5 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              )}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              placeholder="Search by title or author..."
              className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-slate-200 focus:ring-0 outline-none transition-all duration-300 placeholder:text-slate-400 font-medium"
            />

            {showDropdown && (
              <div className="absolute top-16 left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-blue-900/10 z-50 overflow-y-auto max-h-72 backdrop-blur-xl">
                {results.length === 0 ? (
                  <div className="px-6 py-4 text-sm text-slate-400 font-medium">
                    No books found for &quot;{query}&quot;
                  </div>
                ) : (
                  results.map((book) => (
                    <button
                      key={book._id}
                      onClick={() => handleBookClick(book)}
                      disabled={navigating === book._id}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-blue-50/50 transition-colors border-b border-slate-50 last:border-b-0 text-left disabled:opacity-60"
                    >
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                        {book.coverImageUrl ? (
                          <img
                            src={`${BASE_URL}${book.coverImageUrl}`}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-lg">
                            📖
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-slate-900 truncate">{book.title}</div>
                        <div className="text-xs font-semibold text-slate-400 truncate mt-0.5">{book.author}</div>
                      </div>
                      {navigating === book._id && (
                        <div className="ml-auto flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                          <span className="text-[10px] text-blue-600 font-black uppercase tracking-wider">Opening</span>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
            Categories
          </h2>

          <Link 
            href="/category"
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            See All
          </Link>
        </div>
        
        <div className="flex gap-3">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/category?scrollTo=${encodeURIComponent(cat)}`}
              className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:border-blue-600 transition-all"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* READING NOW */}
      <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
              Reading Now
            </h2>
            <Link href="/my-library" className="text-sm font-bold text-blue-600 hover:underline">
              See All
            </Link>
          </div>

          {readingNow.length === 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-gradient-to-r from-blue-50/50 to-transparent rounded-2xl border border-blue-100/50">
              <div className="relative flex shrink-0">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-blue-100 flex items-center justify-center text-2xl z-20">
                  📖
                </div>
                <div className="absolute -right-2 top-2 w-14 h-14 bg-blue-600 rounded-2xl shadow-lg flex items-center justify-center text-2xl opacity-10 rotate-12 z-10" />
              </div>
              
              <div className="text-center md:text-left flex-grow">
                <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight leading-none">Your shelf is waiting</h3>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mt-2">Ready for your next read?</p>
              </div>

              <Link 
                href="/category" 
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-100 whitespace-nowrap active:scale-95"
              >
                Find a Book
              </Link>
            </div>
          ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {readingNow.map((item) => {
              const cover = item.coverImageUrl
                ? item.coverImageUrl.startsWith('http')
                  ? item.coverImageUrl
                  : `${BASE_URL}${item.coverImageUrl}`
                : '';
              const progress = Math.max(0, Math.min(100, Number(item.progressPercent ?? 0)));

              return (
                <Link
                  key={item.accessId || item.bookId}
                  href={`/book-access/${item.bookId}`}
                  className="shrink-0 w-[140px] group"
                >
                  <div className="w-[140px] h-[200px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-200">
                    {cover ? (
                      <img
                        src={cover}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-2xl">
                        📖
                      </div>
                    )}
                  </div>

                  <div className="mt-2 px-0.5">
                    <div className="text-xs font-bold text-slate-800 truncate">{item.title}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.author}</div>

                    <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-800 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-1 text-[10px] font-bold text-blue-800">{progress}%</div>
                  </div>
                </Link>
              );
            })}
          </div>
          )}
        </section>

      {/* NEW ARRIVALS */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
            New Arrivals
          </h2>
          <Link href="/category" className="text-sm font-bold text-blue-600 hover:underline">
            See All
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {newArrivals.map((book) => {
            const cover = book.coverImageUrl
              ? book.coverImageUrl.startsWith('http')
                ? book.coverImageUrl
                : `${BASE_URL}${book.coverImageUrl}`
              : '';
            return (
              <button
                key={book._id}
                onClick={() => handleBookClick(book)}
                className="shrink-0 w-[140px] group text-left"
              >
                <div className="w-[140px] h-[200px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-200">
                  {cover ? (
                    <img src={cover} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-2xl">📖</div>
                  )}
                </div>
                <div className="mt-2 px-0.5">
                  <div className="text-xs font-bold text-slate-800 truncate">{book.title}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{book.author}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}