import { handleGetAllBookAccess } from "@/lib/actions/admin/book-access-action";
import BookAccessTable from "./_components/BookAccessTable";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const page = (params.page as string) || "1";
  const size = (params.size as string) || "10";
  const search = (params.search as string) || "";

  const response = await handleGetAllBookAccess({
    page: Number(page),
    size: Number(size),
    searchTerm: search,
  });

  if (!response.success) {
    redirect("/login");
  }

  return (
    <BookAccessTable
      accesses={response.bookAccesses || []}
      pagination={response.pagination}
      search={search}
    />
  );
}