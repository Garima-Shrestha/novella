"use client";

import Link from "next/link";

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

  return (
    <div>
      {categories.map((category) => {
        const categoryBooks = books.filter(
          (book) => book.genre?._id === category._id
        );

        // if (categoryBooks.length === 0) return null;

        return (
          <section key={category._id} className="mb-16">
            <h2 className="text-2xl font-bold mb-6">
              {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
            </h2>

            <div className="flex flex-wrap gap-x-10 gap-y-12">
              {categoryBooks.map((book) => (
                <Link
                  key={book._id}
                  href={`/books-before-renting/${book._id}`}
                  className="shrink-0"
                >
                  <div className="w-40">
                    <div className="w-40 h-56 bg-slate-100 rounded-md overflow-hidden border shadow-sm">
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

                    <p className="mt-4 text-sm font-semibold text-center line-clamp-2">
                      {book.title}
                    </p>
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
