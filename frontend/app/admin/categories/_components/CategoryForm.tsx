"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { CategorySchema, CategoryEditSchema, CategoryData, CategoryEditData } from "../schema";
import { handleCreateCategory, handleUpdateCategory } from "@/lib/actions/admin/category-action";

type Mode = "create" | "edit";

export interface CategoryItem {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function CategoryForm({
  mode,
  category,
  onSuccess,
  onCancel,
}: {
  mode: Mode;
  category?: CategoryItem | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === "edit";

  // For create: only "name" is needed (backend CreateCategoryDto only picks name).
  // For edit: allow name + isActive.
  const resolverSchema = isEdit ? CategoryEditSchema : CategorySchema.pick({ name: true });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryData | CategoryEditData>({
    resolver: zodResolver(resolverSchema as any),
    defaultValues: isEdit
      ? { name: category?.name || "", isActive: category?.isActive ?? true }
      : { name: "" },
  });

  useEffect(() => {
    if (isEdit && category) {
      setValue("name" as any, category.name);
      setValue("isActive" as any, category.isActive);
    }
    if (!isEdit) {
      reset({ name: "" } as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, category?._id]);

  const onSubmit = async (data: any) => {
    setError(null);

    if (!isEdit) {
      // Create: send only { name }
      const payload = { name: String(data.name || "").trim() };

      startTransition(async () => {
        try {
          const res = await handleCreateCategory(payload);

          if (!res.success) {
            toast.error(res.message || "Category creation failed", {
              containerId: "admin-category-form",
            });
            setError(res.message || "Category creation failed");
            return;
          }

          toast.success("Category created successfully", {
            containerId: "admin-category-form",
            autoClose: 1000,
          });

          reset({ name: "" } as any);
          onSuccess?.();
        } catch (err: any) {
          toast.error(err.message || "Category creation failed", {
            containerId: "admin-category-form",
          });
          setError(err.message || "Category creation failed");
        }
      });

      return;
    }

    // Edit
    if (!category?._id) return;

    const nextName = String(data.name ?? category.name).trim();
    const nextIsActive = typeof data.isActive === "boolean" ? data.isActive : category.isActive;

    const isChanged =
      nextName.toLowerCase() !== category.name.toLowerCase() ||
      nextIsActive !== category.isActive;

    if (!isChanged) {
      toast.info("No changes detected", { containerId: "admin-category-form" });
      return;
    }

    const payload: any = {};
    if (nextName && nextName.toLowerCase() !== category.name.toLowerCase()) payload.name = nextName;
    if (nextIsActive !== category.isActive) payload.isActive = nextIsActive;

    startTransition(async () => {
      try {
        const res = await handleUpdateCategory(category._id, payload);

        if (!res.success) {
          toast.error(res.message || "Category update failed", {
            containerId: "admin-category-form",
          });
          setError(res.message || "Category update failed");
          return;
        }

        toast.success("Category updated successfully", {
          containerId: "admin-category-form",
          autoClose: 1000,
          onClose: () => {
            onSuccess?.();
          },
        });
      } catch (err: any) {
        toast.error(err.message || "Category update failed", {
          containerId: "admin-category-form",
        });
        setError(err.message || "Category update failed");
      }
    });
  };

  const activeValue = watch("isActive" as any);

  return (
    <div className="w-full">
      <ToastContainer containerId="admin-category-form" position="top-right" autoClose={3000} />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black tracking-tight text-blue-900">
            {isEdit ? "Edit Category" : "Create Category"}
          </h2>

          {isEdit && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase">
              Category name
            </label>
            <input
              type="text"
              {...register("name" as any)}
              placeholder="e.g. Fiction"
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
            />
            {errors?.name && (
              <p className="text-xs text-red-600">{(errors as any).name.message}</p>
            )}
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 bg-slate-50">
              <div>
                <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">
                  Status
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {activeValue ? "Active" : "Inactive"}
                </p>
              </div>

              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  {...register("isActive" as any)}
                />
                Active
              </label>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 text-center font-bold bg-red-50 py-2 rounded border border-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || pending}
            className="w-full h-10 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md font-bold text-xs uppercase transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting || pending
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
              ? "Update Category"
              : "Create Category"}
          </button>
        </form>
      </div>
    </div>
  );
}