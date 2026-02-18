"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DeleteModal from "@/app/_components/DeleteModal";
import CategoryForm, { CategoryItem } from "./CategoryForm";
import {
  handleDeleteCategory,
  handleUpdateCategory,
} from "@/lib/actions/admin/category-action";

export default function CategoryList({ categories }: { categories: CategoryItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Inline edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  const sortedCategories = useMemo(() => {
    const list = Array.isArray(categories) ? [...categories] : [];
    return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [categories]);

  const startEdit = (c: CategoryItem) => {
    setEditId(c._id);
    setEditName(c.name || "");
    setEditIsActive(!!c.isActive);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditIsActive(true);
  };

  const saveEdit = (c: CategoryItem) => {
    if (!editId || editId !== c._id) return;

    const nextName = editName.trim();
    const nextActive = !!editIsActive;

    const isChanged =
      nextName.toLowerCase() !== (c.name || "").toLowerCase() ||
      nextActive !== !!c.isActive;

    if (!isChanged) {
      toast.info("No changes detected", { containerId: "admin-category" });
      cancelEdit();
      return;
    }

    const payload: any = {};
    if (nextName && nextName.toLowerCase() !== (c.name || "").toLowerCase()) payload.name = nextName;
    if (nextActive !== !!c.isActive) payload.isActive = nextActive;

    startTransition(async () => {
      try {
        const res = await handleUpdateCategory(c._id, payload);

        if (!res.success) {
          toast.error(res.message || "Update failed", { containerId: "admin-category" });
          return;
        }

        toast.success("Category updated successfully", {
          containerId: "admin-category",
          autoClose: 800,
          onClose: () => {
            cancelEdit();
            router.refresh();
          },
        });
      } catch (err: any) {
        toast.error(err.message || "Update failed", { containerId: "admin-category" });
      }
    });
  };

  const onDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const res = await handleDeleteCategory(deleteId);

      if (!res.success) {
        toast.error(res.message || "Delete failed", { containerId: "admin-category" });
        return;
      }

      toast.success("Category deleted successfully", {
        containerId: "admin-category",
        autoClose: 800,
        onClose: () => router.refresh(),
      });
    } catch (err: any) {
      toast.error(err.message || "Delete failed", { containerId: "admin-category" });
    } finally {
      setDeleteId(null);
    }
  };

  const StatusBadge = ({ active }: { active: boolean }) => {
    return (
      <span
        className={`inline-flex items-center gap-2 text-[11px] font-black px-3 py-1 rounded-full border whitespace-nowrap ${
          active
            ? "bg-blue-50 text-blue-700 border border-blue-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${active ? "bg-green-600" : "bg-slate-500"}`} />
        {active ? "ACTIVE" : "INACTIVE"}
      </span>
    );
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen w-full font-sans antialiased">
      <ToastContainer containerId="admin-category" position="top-right" autoClose={3000} />

      <DeleteModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={onDeleteConfirm}
        title="Delete Confirmation"
        description="This category will be permanently removed. Are you sure you want to continue?"
      />

      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="max-w-7xl mx-auto w-full"> 
          <CategoryForm mode="create" onSuccess={() => router.refresh()} />
        </div>

        {/* LIST PORTION */}
        <div className="w-full">
          <div className="w-full overflow-x-auto border border-gray-200 rounded-xl shadow-sm bg-white">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-xl font-black text-blue-900 leading-6">
                    Categories
                  </h1>
                  <p className="text-sm text-gray-600 mt-2">
                    Manage categories (create, edit, delete)
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-black text-slate-800 whitespace-nowrap">
                    Total: <span className="text-blue-900">{sortedCategories.length}</span>
                  </p>
                </div>
              </div>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedCategories.map((c) => {
                  const isRowEditing = editId === c._id;

                  return (
                    <tr key={c._id} className="border-b border-gray-100 hover:bg-slate-50/60 transition">
                      {/* NAME */}
                      <td className="p-4">
                        {isRowEditing ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Category name"
                            disabled={pending}
                          />
                        ) : (
                          <span className="text-sm text-gray-900 font-semibold">{c.name}</span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="p-4">
                        {isRowEditing ? (
                          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 whitespace-nowrap">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={editIsActive}
                              onChange={(e) => setEditIsActive(e.target.checked)}
                              disabled={pending}
                            />
                            Active
                          </label>
                        ) : (
                          <StatusBadge active={!!c.isActive} />
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4 space-x-2 whitespace-nowrap">
                        {isRowEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(c)}
                              disabled={pending}
                              className="text-xs text-white bg-blue-600 px-3 py-2 rounded-md font-bold uppercase hover:bg-blue-700 disabled:opacity-60"
                            >
                              {pending ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={pending}
                              className="text-xs text-gray-700 border border-gray-300 px-3 py-2 rounded-md font-bold uppercase hover:bg-gray-50 disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(c)}
                              className="text-xs text-white bg-blue-600 px-3 py-2 rounded-md font-bold uppercase hover:bg-blue-700"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => setDeleteId(c._id)}
                              className="text-xs text-white bg-red-600 px-3 py-2 rounded-md font-bold uppercase hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {sortedCategories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center p-8 text-sm text-gray-600">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {editId && (
              <div className="px-6 py-4 bg-[#fff7ed] border-t border-orange-200 text-sm text-orange-900 font-semibold">
                Editing inline — don’t forget to Save.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}