import { redirect } from "next/navigation";

import { handleGetAllUsers } from "@/lib/actions/admin/user-action";
import { handleGetAllBooks } from "@/lib/actions/admin/books-before-renting-action";
import { handleGetAllCategories } from "@/lib/actions/admin/category-action";
import { handleGetAllBookAccess } from "@/lib/actions/admin/book-access-action";

import Dashboard from "./_components/Dashboard";

export default async function Page() {
  const size = 10;

  const usersRes = await handleGetAllUsers({ page: 1, size });
  const booksRes = await handleGetAllBooks({ page: 1, size });
  const categoriesRes = await handleGetAllCategories();
  const bookAccessRes = await handleGetAllBookAccess({ page: 1, size });

  if (
    !usersRes.success ||
    !booksRes.success ||
    !categoriesRes.success ||
    !bookAccessRes.success
  ) {
    redirect("/login");
  }

  const totalUsers =
    usersRes.pagination?.totalRecords ??
    ((Number(usersRes.pagination?.totalPages || 1) - 1) * size + (usersRes.users?.length || 0));

  const totalBooks =
    booksRes.pagination?.totalRecords ??
    ((Number(booksRes.pagination?.totalPages || 1) - 1) * size + (booksRes.books?.length || 0));

  const totalRentals =
    bookAccessRes.pagination?.totalRecords ??
    ((Number(bookAccessRes.pagination?.totalPages || 1) - 1) * size +
      (bookAccessRes.bookAccesses?.length || 0));

  return (
    <Dashboard
      totalUsers={totalUsers}
      totalBooks={totalBooks}
      totalCategories={categoriesRes.categories?.length || 0}
      totalRentals={totalRentals}
      recentAccesses={bookAccessRes.bookAccesses || []}
    />
  );
}