"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface Category {
  _id: string;
  name: string;
}

interface Book {
  _id: string;
  title: string;
  coverImageUrl?: string;
  genre?: {
    _id: string;
    name: string;
  };
}

interface Props {
  categories: Category[];
  books: Book[];
}

export default function CategoryPage({ categories, books }: Props) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

  const searchParams = useSearchParams();

  const slugify = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    const targetName = searchParams.get("scrollTo");
    if (!targetName) return;

    const targetId = `cat-${slugify(targetName)}`;

    const t = setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        const headerOffset = 110; 
        const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);

    return () => clearTimeout(t);
  }, [searchParams]);


  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white">
      {categories.map((category) => {
        const categoryBooks = books.filter(
          (book) => book.genre?._id === category._id
        );

        // if (categoryBooks.length === 0) return null;

        return (
          <section key={category._id} id={`cat-${slugify(category.name)}`} className="mb-10 last:mb-0 scroll-mt-40">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
            </h2>

            <div className="flex flex-wrap gap-6">
              {categoryBooks.map((book) => (
                <Link
                  key={book._id}
                  href={`/books-before-renting/${book._id}`}
                  className="shrink-0 block"
                >
                  <div className="w-40">
                    <div className="w-40 h-56 bg-slate-100 rounded-md overflow-hidden border border-slate-200 shadow-sm">
                      {book.coverImageUrl ? (
                        <img
                          src={`${BASE_URL}${book.coverImageUrl}`}
                          alt={book.title}
                          className="block w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                          No Cover
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight">
                        {book.title}
                      </p>
                      <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Available to Rent
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}