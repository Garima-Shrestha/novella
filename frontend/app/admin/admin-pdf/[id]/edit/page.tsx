import { redirect } from "next/navigation";
import UpdateAdminPdfForm from "../../_components/UpdateAdminPdfForm";
import { getAdminPdfById } from "@/lib/api/admin/admin-pdf";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    throw new Error("Admin PDF id missing in route.");
  }

  const res = await getAdminPdfById(id);

  if (!res?.success) {
    redirect("/login");
  }

  return (
    <div>
      <UpdateAdminPdfForm pdf={res.data} />
    </div>
  );
}
