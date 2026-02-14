"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { BookEditSchema, BookEditData } from "../schema";
import { handleUpdateBook } from "@/lib/actions/admin/books-before-renting-action";


interface Category {
    _id: string;
    name: string;
}

export default function UpdateBookForm({ book, categories }: { book: any; categories: Category[] }) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [oldImage, setOldImage] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [oldBook, setOldBook] = useState<BookEditData | null>(null);
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

    const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<BookEditData>({
        resolver: zodResolver(BookEditSchema) as unknown as any,
    });

    useEffect(() => {
        if (!book) return;

        if (book.coverImageUrl) setOldImage(`${BASE_URL}${book.coverImageUrl}`);

        setOldBook({
            title: book.title,
            author: book.author,
            genre: book.genre,
            pages: book.pages,
            price: book.price,
            publishedDate: book.publishedDate,
            description: book.description,
            coverImage: undefined,
        });

        setValue("title", book.title);
        setValue("author", book.author);
        setValue("genre", book.genre?._id || book.genre);
        setValue("pages", book.pages);
        setValue("price", book.price);
        setValue("publishedDate", book.publishedDate);
        setValue("description", book.description);
    }, [book, BASE_URL, setValue]);

    useEffect(() => {
        return () => {
        if (previewImage) URL.revokeObjectURL(previewImage);
        };
    }, [previewImage]);

    const handleImageChange = (file: File | undefined, onChange: (file?: File) => void) => {
        if (file) {
        const objectUrl = URL.createObjectURL(file);
        setPreviewImage(objectUrl);
        } else {
        setPreviewImage(null);
        }
        onChange(file);
    };

    const handleDismissImage = (onChange?: (file?: File) => void) => {
        setPreviewImage(null);
        onChange?.(undefined);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onSubmit = async (data: BookEditData) => {
        setError(null);
        // startTransition(async () => {
        try {
            if (!oldBook) return;

            const isChanged =
                data.title !== oldBook.title ||
                data.author !== oldBook.author ||
                data.genre !== oldBook.genre ||
                data.pages !== oldBook.pages ||
                data.price !== oldBook.price ||
                data.publishedDate !== oldBook.publishedDate ||
                data.description !== oldBook.description ||
                !!data.coverImage;

            if (!isChanged) {
                toast.info("No changes detected", { containerId: "admin-book-edit" });
                return;
            }

            const formData = new FormData();
            if (data.title) formData.append("title", data.title);
            if (data.author) formData.append("author", data.author);
            if (data.genre) formData.append("genre", data.genre);
            if (data.pages) formData.append("pages", data.pages.toString());
            if (data.price) formData.append("price", data.price.toString());
            if (data.publishedDate) formData.append("publishedDate", data.publishedDate);
            if (data.description) formData.append("description", data.description);
            if (data.coverImage) formData.append("coverImageUrl", data.coverImage);

            const response = await handleUpdateBook(book._id, formData);

            if (!response.success) {
            toast.error(response.message || "Failed to update book", { containerId: "admin-book-edit" });
            setError(response.message || "Failed to update book");
            return;
            }

            toast.success("Book updated successfully", {
                containerId: "admin-book-edit",
                autoClose: 1000,
                onClose: () => router.push("/admin/books-before-renting"),
            });
        } catch (err: any) {
            toast.error(err.message || "Failed to update book");
            setError(err.message || "Failed to update book");
        }
        // });
    };

    return (
        <div className="p-8 max-w-lg mx-auto bg-white border border-slate-200 rounded-xl shadow-sm mt-6">
            <ToastContainer containerId="admin-book-edit" position="top-right" autoClose={3000} />
            
            <h2 className="text-2xl font-black tracking-tight text-blue-900 mb-8">Update Book</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Cover Image */}
            <div className="flex flex-col items-center justify-center p-6 bg-blue-50/50 border border-blue-100 rounded-lg">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-4">
                    UPLOAD COVER IMAGE
                </label>

                <div className="mb-4">
                    {previewImage || oldImage ? (
                    <div className="relative">
                        <img
                        src={previewImage || oldImage!}
                        alt="Cover Preview"
                        className="w-24 h-32 object-cover border-2 border-white shadow-sm"
                        />
                        <Controller
                        name="coverImage"
                        control={control}
                        render={({ field: { onChange } }) => (
                            <button
                            type="button"
                            onClick={() => handleDismissImage(onChange)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                            >
                            ✕
                            </button>
                        )}
                        />
                    </div>
                    ) : (
                    <div className="w-24 h-32 bg-white border border-slate-200 flex items-center justify-center text-slate-300">
                        <span className="text-xs">No Cover</span>
                    </div>
                    )}
                </div>

                <div className="w-full flex justify-center">
                    <Controller
                    name="coverImage"
                    control={control}
                    render={({ field: { onChange } }) => (
                        <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="text-[12px] text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8] cursor-pointer"
                        onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                        />
                    )}
                    />
                </div>
                    {errors.coverImage && <p className="text-xs text-red-600 mt-2">{errors.coverImage.message}</p>}
                </div>

                {/* Text Fields */}
                <div className="space-y-4">
                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">Title</label>
                        <input
                            {...register("title")}
                            placeholder="Book title"
                            className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        />
                    {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
                    </div>

                    {/* Author */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">Author</label>
                        <input
                            {...register("author")}
                            placeholder="Author name"
                            className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        />
                    {errors.author && <p className="text-xs text-red-600">{errors.author.message}</p>}
                    </div>

                    {/* Genre */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">Genre</label>
                        <select
                            {...register("genre")}
                            className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-0 focus:border-slate-300"
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    {errors.genre && <p className="text-xs text-red-600">{errors.genre.message}</p>}
                    </div>

                    <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 uppercase">Pages</label>
                            <input
                            type="number"
                            {...register("pages", { valueAsNumber: true })}
                            className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />
                        {errors.pages && <p className="text-xs text-red-600">{errors.pages.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">Price</label>
                        <input
                        type="number"
                        {...register("price", { valueAsNumber: true })}
                        className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        />
                        {errors.price && <p className="text-xs text-red-600">{errors.price.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">Published Date</label>
                        <input
                        type="date"
                        {...register("publishedDate")}
                        className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        />
                        {errors.publishedDate && <p className="text-xs text-red-600">{errors.publishedDate.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">Description</label>
                        <textarea
                        {...register("description")}
                        className="h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none resize-none placeholder:text-slate-400"
                        />
                        {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
                    </div>
                </div>

                {/* General Error */}
                {error && (
                    <p className="text-xs text-red-600 text-center font-bold bg-red-50 py-2 rounded border border-red-100">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || pending}
                    className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md font-bold text-xs uppercase transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-sm"
                >
                    {isSubmitting || pending ? "Updating book..." : "Update Book"}
                </button>
        </form>
    </div>
  );
}
