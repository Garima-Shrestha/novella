import { handleGetOneBook } from "@/lib/actions/admin/books-before-renting-action";
import Link from "next/link";

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    if (!id) {
        throw new Error(
        "Book id missing in route. URL must be /admin/books-before-renting/[id]"
        );
    }

    const response = await handleGetOneBook(id);

    if (!response.success) {
        throw new Error(response.message || "Failed to load book");
    }

    const book = response.data;

    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
    const imageSrc = book?.coverImageUrl ? `${BASE_URL}${book.coverImageUrl}` : null;

    return (
        <div className="w-full font-sans antialiased">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Link
                href="/admin/books-before-renting"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800"
            >
                <span className="text-lg leading-none">←</span>
                Back to Books
            </Link>

            <Link
                href={`/admin/books-before-renting/${id}/edit`}
                className="inline-flex items-center justify-center rounded-md bg-[#2563eb] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8]"
            >
                Edit Book
            </Link>
            </div>

            <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-[#eef3ff] px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-xl font-black text-blue-900 leading-tight break-words">
                    {book.title}
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                    View book information
                    </p>
                </div>
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-start gap-6">
                <div className="shrink-0">
                    <div className="w-[130px] h-[180px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    {imageSrc ? (
                        <img
                        src={imageSrc}
                        alt={book.title}
                        className="block w-[130px] h-[180px] object-cover"
                        style={{ width: 130, height: 180, objectFit: "cover" }}
                        />
                    ) : (
                        <div className="w-[130px] h-[180px] flex items-center justify-center text-slate-400 font-black">
                        No Cover
                        </div>
                    )}
                    </div>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 min-w-0">
                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                        Title
                        </p>
                        <p className="mt-1 text-sm text-slate-900 break-words">
                        {book.title}
                        </p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 min-w-0">
                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                        Author
                        </p>
                        <p className="mt-1 text-sm text-slate-900 break-words">
                        {book.author}
                        </p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 min-w-0">
                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                        Genre
                        </p>
                        <p className="mt-1 text-sm text-slate-900 break-words">
                        {typeof book.genre === 'object' ? book.genre.name : (book.genre || "-")}
                        </p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 min-w-0">
                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                        Pages
                        </p>
                        <p className="mt-1 text-sm text-slate-900">
                        {book.pages}
                        </p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 min-w-0">
                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                        Price
                        </p>
                        <p className="mt-1 text-sm text-slate-900">
                        ${book.price}
                        </p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 min-w-0">
                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                        Published Date
                        </p>
                        <p className="mt-1 text-sm text-slate-900">
                        {book.publishedDate || "-"}
                        </p>
                    </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 min-w-0">
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                        Description
                    </p>
                    <p className="mt-2 text-sm text-slate-900 whitespace-pre-wrap leading-relaxed break-words">
                        {book.description || "-"}
                    </p>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
    );
}
