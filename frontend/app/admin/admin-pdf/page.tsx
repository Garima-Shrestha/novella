import { handleGetAllAdminPdfs } from "@/lib/actions/admin/admin-pdf-action";
import AdminPdfTable from "./_components/AdminPdfTable";
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

  const response = await handleGetAllAdminPdfs({
    page: Number(page),
    size: Number(size),
    searchTerm: search,
  });

  if (!response.success) {
    redirect("/login");
  }

  return (
    <AdminPdfTable
      pdfs={response.pdfs}
      pagination={response.pagination}
      search={search}
    />
  );
}
