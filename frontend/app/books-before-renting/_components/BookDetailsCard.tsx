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
    <div className="max-w-4xl mx-auto bg-white text-slate-900 border border-slate-200 rounded-xl shadow-sm p-8">
      {/* Book Title */}
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        {book.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Cover Image */}
        <div className="flex justify-center">
          {book.coverImageUrl ? (
            <img
              src={`${BASE_URL}${book.coverImageUrl}`}
              alt={book.title}
              className="w-60 h-80 object-cover rounded-lg border"
            />
          ) : (
            <div className="w-60 h-80 bg-slate-100 flex items-center justify-center text-slate-400 font-semibold rounded-lg border">
              No Cover
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="space-y-4 text-sm text-slate-800">
          <div>
            <span className="font-semibold">Author:</span> {book.author}
          </div>

          <div>
            <span className="font-semibold">Price:</span> ${book.price}
          </div>

          <div>
            <span className="font-semibold">Genre:</span> {book.genre?.name}
          </div>

          <div>
            <span className="font-semibold">Published Date:</span>{" "}
            {book.publishedDate}
          </div>

          <div>
            <span className="font-semibold">Pages:</span> {book.pages}
          </div>

          <div>
            <span className="font-semibold block mb-1">Description:</span>
            <p className="text-slate-600 leading-relaxed">{book.description}</p>
          </div>

          {/* Rent Button */}
          <div className="pt-6 flex justify-center">
            <button
              type="button"
              className="w-48 h-11 rounded-md bg-blue-800 hover:bg-blue-700 text-white font-bold transition-colors"
            >
              Rent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}