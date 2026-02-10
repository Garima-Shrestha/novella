"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteBook } from "@/lib/api/admin/books-before-renting";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteModal from "@/app/_components/DeleteModal";

interface Book {
    _id: string;
    title: string;
    author: string;
    genre: string;
    pages: number;
    price: number;
    publishedDate?: string;
    description?: string;
    coverImageUrl?: string;
}


export default function BookTable({ books, pagination, search }: { books: Book[]; pagination: any; search?: string;}
) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (searchTerm === "" && (search || "") !== "") {
        router.push(`/admin/books-before-renting?page=1&size=${pagination.size}`);
        }
    }, [searchTerm, search, pagination.size, router]);

    const handleDeleteBook = async (id: string) => {
        try {
        await deleteBook(id);
        toast.success("Book deleted successfully");
        router.refresh();
        } catch (err: any) {
        toast.error(err.message || "Delete failed");
        }
    };

    const onDeleteConfirm = async () => {
        if (!deleteId) return;
        await handleDeleteBook(deleteId);
        setDeleteId(null);
    };

    const handleSearchChange = () => {
        router.push(
        `/admin/books-before-renting?page=1&size=${pagination.size}` +
            (searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : "")
        );
    };

    const makePagination = (): React.ReactElement[] => {
        const pages = [];
        const currentPage = pagination.page;
        const totalPages = pagination.totalPages;
        const delta = 2;

        const prevHref =
        `/admin/books-before-renting?page=${currentPage - 1}&size=${pagination.size}` +
        (search ? `&search=${encodeURIComponent(search)}` : "");
        pages.push(
        <Link
            key="prev"
            className={`px-3 py-1 border rounded-md ${
            currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                : "bg-white text-blue-500 hover:bg-blue-100"
            }`}
            href={currentPage === 1 ? "#" : prevHref}
        >
            Previous
        </Link>
        );

        let startPage = Math.max(1, currentPage - delta);
        let endPage = Math.min(totalPages, currentPage + delta);

        if (startPage > 1) {
        const href =
            `/admin/books-before-renting?page=1&size=${pagination.size}` +
            (search ? `&search=${encodeURIComponent(search)}` : "");
        pages.push(
            <Link
            key={1}
            className="px-3 py-1 border rounded-md bg-white text-blue-500 hover:bg-blue-100"
            href={href}
            >
            1
            </Link>
        );
        if (startPage > 2) pages.push(<span key="ellipsis1" className="px-2 text-gray-500">...</span>);
        }

        for (let i = startPage; i <= endPage; i++) {
        const href =
            `/admin/books-before-renting?page=${i}&size=${pagination.size}` +
            (search ? `&search=${encodeURIComponent(search)}` : "");
        pages.push(
            <Link
            key={i}
            className={`px-3 py-1 border rounded-md ${
                i === currentPage ? "bg-blue-500 text-white" : "bg-white text-blue-500 hover:bg-blue-100"
            }`}
            href={href}
            >
            {i}
            </Link>
        );
        }

        if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push(<span key="ellipsis2" className="px-2 text-gray-500">...</span>);
        const href =
            `/admin/books-before-renting?page=${totalPages}&size=${pagination.size}` +
            (search ? `&search=${encodeURIComponent(search)}` : "");
        pages.push(
            <Link
            key={totalPages}
            className="px-3 py-1 border rounded-md bg-white text-blue-500 hover:bg-blue-100"
            href={href}
            >
            {totalPages}
            </Link>
        );
        }

        const nextHref =
        `/admin/books-before-renting?page=${currentPage + 1}&size=${pagination.size}` +
        (search ? `&search=${encodeURIComponent(search)}` : "");
        pages.push(
        <Link
            key="next"
            className={`px-3 py-1 border rounded-md ${
            currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                : "bg-white text-blue-500 hover:bg-blue-100"
            }`}
            href={currentPage === totalPages ? "#" : nextHref}
        >
            Next
        </Link>
        );

        return pages;
    };

    const BASE_URL = "http://localhost:5050";

    return (
        <div className="p-6 bg-white min-h-screen w-full font-sans antialiased">
            <ToastContainer />

            <DeleteModal
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={onDeleteConfirm}
                title="Delete Confirmation"
                description="This book will be permanently removed. Are you sure?"
            />

            <div className="mb-4 flex items-center justify-between">
                <Link
                href="/admin/books-before-renting/create"
                className="text-sm text-white bg-[#00A859] px-4 py-2 rounded font-bold inline-block"
                >
                + Add Book
                </Link>

                <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchChange();
                    }}
                    placeholder="Search books..."
                    className="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <button
                    onClick={handleSearchChange}
                    className="text-sm text-white bg-[#2563eb] px-4 py-2 rounded font-bold inline-block"
                >
                    Search
                </button>
                </div>
            </div>

            <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Cover</th>
                    <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Title</th>
                    <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Author</th>
                    <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Genre</th>
                    <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Pages</th>
                    <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Price</th>
                    <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((book) => (
                    <tr key={book._id} className="border-b border-gray-100">
                        <td className="p-4">
                        {book.coverImageUrl ? (
                            <img
                            src={book.coverImageUrl ? `${BASE_URL}${book.coverImageUrl}` : "/default-book.png"}
                            alt={book.title}
                            className="w-10 h-10 object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                            ?
                            </div>
                        )}
                        </td>
                        <td className="p-4 text-sm text-gray-800">{book.title}</td>
                        <td className="p-4 text-sm text-gray-800">{book.author}</td>
                        <td className="p-4 text-sm text-gray-800">{book.genre}</td>
                        <td className="p-4 text-sm text-gray-800">{book.pages}</td>
                        <td className="p-4 text-sm text-gray-800">${book.price}</td>
                        <td className="p-4 space-x-2">
                        <Link
                            href={`/admin/books-before-renting/${book._id}`}
                            className="text-xs text-blue-600 border border-blue-600 px-3 py-1.5 rounded font-bold uppercase hover:bg-blue-50"
                        >
                            View
                        </Link>

                        <Link
                            href={`/admin/books-before-renting/${book._id}/edit`}
                            className="text-xs text-white bg-blue-600 px-3 py-1.5 rounded font-bold uppercase hover:bg-blue-700"
                        >
                            Edit
                        </Link>

                        <button
                            onClick={() => setDeleteId(book._id)}
                            className="text-xs text-white bg-red-600 px-3 py-1.5 rounded font-bold uppercase hover:bg-red-700"
                        >
                            Delete
                        </button>
                        </td>
                    </tr>
                    ))}
                    {books.length === 0 && (
                    <tr>
                        <td colSpan={7} className="text-center p-4">
                        No books found.
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>

                <div className="p-4 flex justify-between items-center bg-gray-50">
                <div className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="space-x-2">{makePagination()}</div>
                </div>
            </div>
        </div>
    );
}
