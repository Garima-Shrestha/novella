"use client";

interface Genre {
  _id: string;
  name: string;
}

interface Book {
  _id: string;
  title: string;
  author: string;
  price: number;
  pages: number;
  description: string;
  publishedDate: string;
  genre: Genre;
  coverImageUrl: string;
}

interface Props {
  book: Book;
}

export default function BookDetailsCard({ book }: Props) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

  return (
    <div className="max-w-6xl mx-auto bg-white p-8">
      <div className="flex flex-col lg:flex-row gap-12">

        {/* LEFT SIDE */}
        <div className="shrink-0">

          <div className="w-[200px] h-[300px] overflow-hidden rounded-lg border border-slate-200 shadow-sm">
            {book.coverImageUrl ? (
              <img
                src={`${BASE_URL}${book.coverImageUrl}`}
                alt={book.title}
                className="block w-[200px] h-[300px] object-cover"
                style={{ width: 200, height: 300, objectFit: "cover" }}
              />
            ) : (
              <div className="w-[200px] h-[300px] flex items-center justify-center text-slate-400 font-semibold">
                No Cover
              </div>
            )}
          </div>

          {/* KEEP THIS SAME (not reduced) */}
          <div className="mt-6 text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Genre:</span>{" "}
            {book.genre?.name}
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 min-w-0">

          {/* was text-4xl */}
          <h1 className="text-3xl font-extrabold text-blue-900 leading-tight break-words">
            {book.title}
          </h1>

          {/* was text-lg */}
          <div className="mt-3 text-base text-slate-600">
            <span className="font-semibold">Author:</span> {book.author}
          </div>

          <div className="mt-8">
            {/* was text-2xl */}
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Description:
            </h2>

            {/* was text-base */}
            <p className="text-slate-600 leading-relaxed text-sm break-words">
              {book.description}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">

            <div className="bg-slate-50 rounded-xl p-6 text-center">
              {/* was text-xs */}
              <div className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold">
                Pages
              </div>
              {/* was text-2xl */}
              <div className="mt-2 text-xl font-bold text-slate-900">
                {book.pages}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <div className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold">
                Price
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                ${book.price}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <div className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold">
                Published Date
              </div>
              {/* was text-sm */}
              <div className="mt-2 text-xs font-bold text-slate-900">
                {book.publishedDate}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <div className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold">
                Genre
              </div>
              {/* was text-sm */}
              <div className="mt-2 text-xs font-bold text-slate-900">
                {book.genre?.name}
              </div>
            </div>

          </div>

          <div className="mt-1">
            <button
              type="button"
              className="px-7 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition text-sm"
            >
              Rent
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
