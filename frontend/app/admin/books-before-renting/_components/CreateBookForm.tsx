"use client";

import { Controller, useForm } from "react-hook-form";
import { BookData, BookSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import { toast, ToastContainer } from "react-toastify";
import { handleCreateBook } from "@/lib/actions/admin/books-before-renting-action";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";


interface Category {
    _id: string;
    name: string;
}

export default function CreateBookForm({ categories }: { categories: Category[] }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<BookData>({
        resolver: zodResolver(BookSchema) as any,
    });

    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (file: File | undefined, onChange: (file: File | undefined) => void) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
        onChange(file);
    };

    const handleDismissImage = (onChange?: (file: File | undefined) => void) => {
        setPreviewImage(null);
        onChange?.(undefined);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onSubmit = async (data: BookData) => {
        setError(null);
        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append("title", data.title);
                formData.append("author", data.author);
                formData.append("genre", data.genre);
                formData.append("pages", data.pages.toString());
                formData.append("price", data.price.toString());
                if (data.publishedDate) formData.append("publishedDate", data.publishedDate);
                if (data.description) formData.append("description", data.description);
                if (data.coverImage) formData.append("coverImageUrl", data.coverImage);

                const response = await handleCreateBook(formData);

                if (!response.success) {
                    toast.error(response.message || "Failed to create book", { containerId: "admin-book-create" });
                    setError(response.message || "Failed to create book");
                    return;
                }

                toast.success("Book created successfully", {
                    containerId: "admin-book-create", 
                    autoClose: 1000,
                    onClose: () => router.push("/admin/books-before-renting"),
                });

            } catch (err: any) {
                toast.error(err.message || "Failed to create book", { containerId: "admin-book-create" });
                setError(err.message || "Failed to create book");
            }
        });
    };

    return (
        <div className="p-8 max-w-lg mx-auto bg-white border border-slate-200 rounded-xl shadow-sm mt-6">
            <ToastContainer containerId="admin-book-create" position="top-right" autoClose={3000} />
            
            <h2 className="text-2xl font-black tracking-tight text-blue-900 mb-8">Create Book</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Cover Image */}
                <div className="flex flex-col items-center justify-center p-6 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-4">UPLOAD COVER IMAGE</label>
                    <div className="mb-4">
                        {previewImage ? (
                            <div className="relative">
                                <img
                                    src={previewImage}
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
                                    className="text-[12px] text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8] cursor-pointer"
                                    onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                                    accept=".jpg,.jpeg,.png,.webp"
                                />
                            )}
                        />
                    </div>
                    {errors.coverImage && <p className="text-xs text-red-600 mt-2">{errors.coverImage.message}</p>}
                </div>

                {/* Title */}
                <div className="space-y-1">
                    <label htmlFor="title" className="text-[11px] font-bold text-slate-700 uppercase">Title</label>
                    <input
                        id="title"
                        type="text"
                        {...register("title")}
                        placeholder="Book title"
                        className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />

                    {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
                </div>

                {/* Author */}
                <div className="space-y-1">
                    <label htmlFor="author" className="text-[11px] font-bold text-slate-700 uppercase">Author</label>
                    <input
                        id="author"
                        type="text"
                        {...register("author")}
                        placeholder="Author name"
                        className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    {errors.author && <p className="text-xs text-red-600">{errors.author.message}</p>}
                </div>

                {/* Genre */}
                <div className="space-y-1">
                    <label htmlFor="genre" className="text-[11px] font-bold text-slate-700 uppercase">Genre</label>
                    <select
                        id="genre"
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

                {/* Pages */}
                <div className="space-y-1">
                    <label htmlFor="pages" className="text-[11px] font-bold text-slate-700 uppercase">Pages</label>
                    <input
                        id="pages"
                        type="number"
                        {...register("pages", { valueAsNumber: true })}
                        placeholder="Number of pages"
                        className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    {errors.pages && <p className="text-xs text-red-600">{errors.pages.message}</p>}
                </div>

                {/* Price */}
                <div className="space-y-1">
                    <label htmlFor="price" className="text-[11px] font-bold text-slate-700 uppercase">Price</label>
                    <input
                        id="price"
                        type="number"
                        {...register("price", { valueAsNumber: true })}
                        placeholder="Book price"
                        className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    {errors.price && <p className="text-xs text-red-600">{errors.price.message}</p>}
                </div>

                {/* Published Date */}
                <div className="space-y-1">
                    <label htmlFor="publishedDate" className="text-[11px] font-bold text-slate-700 uppercase">Published Date</label>
                    <input
                        id="publishedDate"
                        type="date"
                        {...register("publishedDate")}
                        className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />

                    {errors.publishedDate && <p className="text-xs text-red-600">{errors.publishedDate.message}</p>}
                </div>

                {/* Description */}
                <div className="space-y-1">
                    <label htmlFor="description" className="text-[11px] font-bold text-slate-700 uppercase">Description</label>
                    <textarea
                        id="description"
                        {...register("description")}
                        placeholder="Book description"
                        className="h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none resize-none placeholder:text-slate-400"
                    />
                    {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
                </div>

                {/* General Error */}
                {error && (
                    <p className="text-xs text-red-600 text-center font-bold bg-red-50 py-2 rounded border border-red-100">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || pending}
                    className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md font-bold text-xs uppercase transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-sm"
                >
                    {isSubmitting || pending ? "Creating book..." : "Create book"}
                </button>
            </form>
        </div>
    );
}
