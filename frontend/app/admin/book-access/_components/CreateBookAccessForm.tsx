"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { BookAccessCreateSchema, BookAccessCreateData } from "@/app/admin/book-access/schema";
import { createBookAccess, fetchAvailableBooksForUser } from "@/lib/api/admin/book-access";
import { fetchUsers } from "@/lib/api/admin/user";

function endOfDayISO(dateStr: string) {
  const d = new Date(`${dateStr}T23:59:59.999`);
  return d.toISOString();
}

function todayYYYYMMDD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CreateBookAccessForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [users, setUsers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookAccessCreateData>({
    resolver: zodResolver(BookAccessCreateSchema) as any,
  });

  const minDate = useMemo(() => todayYYYYMMDD(), []);

  useEffect(() => {
    let ignore = false;

    const loadLists = async () => {
      setLoadingLists(true);
      setListError(null);

      try {
        const usersRes = await fetchUsers(1, 200, "");
        if (ignore) return;
        if (!usersRes?.success) throw new Error(usersRes?.message || "Failed to load users");
        setUsers(usersRes.data || []);
        setBooks([]); // empty until a user is selected
      } catch (e: any) {
        if (ignore) return;
        setListError(e?.message || "Failed to load dropdown lists");
      } finally {
        if (!ignore) setLoadingLists(false);
      }
    };

    loadLists();
    return () => {
      ignore = true;
    };
  }, []);

  const selectedUserId = watch("user");

  useEffect(() => {
    let ignore = false;

    const loadBooksForUser = async () => {
      if (!selectedUserId) {
        setBooks([]);
        setValue("book", ""); // reset book selection
        return;
      }

      try {
        setLoadingLists(true);
        setListError(null);

        const res = await fetchAvailableBooksForUser(selectedUserId, "");

        if (ignore) return;

        if (!res?.success) throw new Error(res?.message || "Failed to load available books");

        setBooks(res.data || []);
        setValue("book", ""); // reset whenever user changes
      } catch (e: any) {
        if (ignore) return;
        setBooks([]);
        setValue("book", "");
        setListError(e?.message || "Failed to load available books");
      } finally {
        if (!ignore) setLoadingLists(false);
      }
    };

    loadBooksForUser();

    return () => {
      ignore = true;
    };
  }, [selectedUserId, setValue, fetchAvailableBooksForUser]);

  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u._id,
        label: u.email || u.username || u._id,
      })),
    [users]
  );

  const bookOptions = useMemo(
    () =>
      books.map((b) => ({
        value: b._id,
        label: b.title || b._id,
      })),
    [books]
  );

  const onSubmit = async (data: BookAccessCreateData) => {
    const payload = {
      user: data.user,
      book: data.book,
      rentedAt: new Date().toISOString(),
      expiresAt: endOfDayISO(data.expiresAt),
      isActive: true,
    };

    startTransition(async () => {
      try {
        const res = await createBookAccess(payload);

        if (!res?.success) {
          toast.error(res?.message || "Create book access failed", {
            containerId: "admin-book-access-create",
          });
          return;
        }

        toast.success("Book access created successfully", {
          containerId: "admin-book-access-create",
          autoClose: 1000,
          onClose: () => router.push("/admin/book-access"),
        });
      } catch (e: any) {
        toast.error(e?.message || "Create book access failed", {
          containerId: "admin-book-access-create",
        });
      }
    });
  };

  return (
    <div className="p-8 max-w-xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm mt-6">
      <ToastContainer
        containerId="admin-book-access-create"
        position="top-right"
        autoClose={3000}
      />

      <h2 className="text-2xl font-black tracking-tight text-blue-900 mb-8">
        Create Book Access
      </h2>

      {listError && (
        <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          {listError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* User */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase">
            User
          </label>
          <select
            {...register("user")}
            disabled={loadingLists}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none disabled:bg-slate-50"
          >
            <option value="">
              {loadingLists ? "Loading users..." : "Select user"}
            </option>
            {userOptions.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
          {errors.user?.message && (
            <p className="text-xs text-red-600">{errors.user.message}</p>
          )}
        </div>

        {/* Book */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase">
            Book
          </label>
          <select
            {...register("book")}
            disabled={loadingLists || !selectedUserId}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none disabled:bg-slate-50"
          >
            <option value="">
              {!selectedUserId
                ? "Select user first"
                : loadingLists
                ? "Loading books..."
                : "Select book"}
            </option>
            {bookOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
          {errors.book?.message && (
            <p className="text-xs text-red-600">{errors.book.message}</p>
          )}
        </div>

        {/* Expires At */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase">
            Expires At
          </label>
          <input
            type="date"
            min={minDate}
            {...register("expiresAt")}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none"
          />
          {errors.expiresAt?.message && (
            <p className="text-xs text-red-600">{errors.expiresAt.message}</p>
          )}
        </div>

        <div className="flex items-center gap-3 opacity-70">
          <input id="isActive" type="checkbox" checked disabled className="h-4 w-4" />
          <label htmlFor="isActive" className="text-sm font-bold text-slate-700">
            Active access (default)
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || pending || loadingLists}
          className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md font-bold text-xs uppercase transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-sm"
        >
          {isSubmitting || pending ? "Creating..." : "Create Book Access"}
        </button>
      </form>
    </div>
  );
}